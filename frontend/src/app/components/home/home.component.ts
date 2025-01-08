import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { LoadingComponent } from '../loading/loading.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, NgIf, NgFor, LoadingComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  activeGames: any[] = [];
  loading: boolean = false;
  loadingApp: boolean = false;
  socket!: WebSocket;
  reconnectTimeout: any;

  selectedSport = 'college-basketball';
  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.fetchActiveGames();
    this.connectWebSocket();
  }

  ngOnDestroy() {
    // Close WebSocket and clear timeout when component is destroyed
    if (this.socket) {
      this.socket.close();
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
  }

  fetchActiveGames() {
    this.loading = true;
    this.loadingApp = true;
    const apiUrl = this.getApiUrl(this.selectedSport);
    this.http.get<any>(apiUrl)
      .subscribe({
        next: (response) => {
          this.activeGames = response.activeGames || [];
          this.loading = false;
          this.loadingApp = false;
        },
        error: (error) => {
          console.error('Error fetching active games:', error);
          this.loading = false;
          this.loadingApp = true;
        }
      });
  }

  getApiUrl(sport: string): string {
    const apiBaseUrl = 'http://localhost:3000';  // Directly use localhost


    switch (sport) {
      case "college-basketball":
        return `${apiBaseUrl}/api/college-basketball/active-games`;
      case "college-basketball-women":
        return `${apiBaseUrl}/api/college-basketball-women/active-games`;
      case "college-football":
        return `${apiBaseUrl}/api/college-football/active-games`;
      default:
        return `${apiBaseUrl}/api/college-basketball/active-games`;
    }
  }

  // WebSocket Connection Logic
  connectWebSocket() {
    const scheme = window.location.protocol === 'https:' ? 'wss' : 'ws';
    // const wsUrl = `${scheme}://localhost:3000/ws`;  // Direct connection to localhost
    const backendHost = window.location.hostname === 'localhost'
      ? 'localhost'
      : 'host.docker.internal';
    const wsUrl = `${scheme}://${backendHost}:3000/ws`;

    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log('WebSocket connected.');
      this.socket.send(JSON.stringify({ type: 'sportChange', sportType: this.selectedSport }))
    };

    this.socket.onmessage = (event) => {
      const packet = JSON.parse(event.data);
      if (packet.label === 'init') {
        this.activeGames = packet.data;
      } else if (packet.label === 'chat') {
        console.log('Live update is this updating:', packet.data);

        // Handle array or single object updates
        const incomingGames = Array.isArray(packet.data) ? packet.data : [packet.data];
        console.log('INCOMING GAMES: ', incomingGames);
        incomingGames.forEach((newGame: any) => {
          const existingGameIndex = this.activeGames.findIndex(
            (g) => g.homeTeam === newGame.homeTeam && g.awayTeam === newGame.awayTeam
          );
          console.log(newGame);
          const formattedGame = {
            homeTeam: newGame.homeTeam || 'Unknown Team',
            awayTeam: newGame.awayTeam || 'Unknown Team',
            homeScore: (newGame.score?.home !== undefined) ? newGame.score.home : 0,
            awayScore: (newGame.score?.away !== undefined) ? newGame.score.away : 0,
            currentPeriod: newGame.currentPeriod || 'N/A',
            gameClock: newGame.gameClock || '00:00'
          };


          if (existingGameIndex !== -1) {
            // Update the existing game
            this.activeGames[existingGameIndex] = { ...this.activeGames[existingGameIndex], ...formattedGame };
          } else {
            // Add the game if not already present
            this.activeGames.push(formattedGame);
          }
        });
      }
    };

    this.socket.onclose = () => {
      console.log('WebSocket closed. Reconnecting...');
      setTimeout(() => this.connectWebSocket(), 5000);
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.socket.close();
    };
  }


  onSportChange(sport: string) {
    this.selectedSport = sport;
    this.fetchActiveGames();
    console.log('This is the sport being passed into SPORTCHANGE: ', sport);
    const sportTypeMap: { [key: string]: string } = {
      'college-basketball': 'college_basketball',
      'college-basketball-women': 'womens_college_basketball',
      'college-football': 'college_football'
    };

    console.log('This is what the sport is being mapped to: ', sportTypeMap[sport]);
    const dbSportType = sportTypeMap[sport] || 'college_basketball';

    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ type: 'sportChange', sportType: dbSportType });
      console.log(`Sending sportCHange to websocket: ${message}`)
      this.socket.send(message);
    } else {
      console.warn('websocket not open, reconnecting ... ');
      this.connectWebSocket();
    }
  }
}
