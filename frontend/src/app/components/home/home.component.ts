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

  // Set the selectedSport to a normalized API value
  selectedSport: string = 'basketball-men';

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.fetchActiveGames();
    this.connectWebSocket();
  }

  ngOnDestroy() {
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
    this.http.get<any>(apiUrl).subscribe({
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
    const apiBaseUrl = 'http://localhost:3000';
    // Now the sport is already in the normalized format.
    switch (sport) {
      case "basketball-men":
        return `${apiBaseUrl}/api/basketball-men/active-games`;
      case "basketball-women":
        return `${apiBaseUrl}/api/basketball-women/active-games`;
      case "football":
        return `${apiBaseUrl}/api/football/active-games`;
      default:
        return `${apiBaseUrl}/api/basketball-men/active-games`;
    }
  }

  // WebSocket Connection Logic
  connectWebSocket() {
    const scheme = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const backendHost = window.location.hostname === 'localhost' ? 'localhost' : 'host.docker.internal';
    const wsUrl = `${scheme}://${backendHost}:3000/ws`;

    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log('WebSocket connected.');
      // Send the selected sport as is (already normalized)
      this.socket.send(JSON.stringify({ type: 'sportChange', sportType: this.selectedSport }));
    };

    this.socket.onmessage = (event) => {
      const packet = JSON.parse(event.data);
      if (packet.label === 'chat') {
        console.log('Live update:', packet.data);
        // Only update if the packet sportType matches the selected sport.
        if (packet.sportType === this.selectedSport) {
          this.activeGames = [];
          const incomingGames = Array.isArray(packet.data) ? packet.data : [packet.data];
          incomingGames.forEach((newGame: any) => {
            const formattedGame = {
              homeTeam: newGame.homeTeam || 'Unknown Team',
              awayTeam: newGame.awayTeam || 'Unknown Team',
              homeScore: newGame.score?.home ?? 0,
              awayScore: newGame.score?.away ?? 0,
              currentPeriod: newGame.currentPeriod || 'N/A',
              gameClock: newGame.gameClock || '00:00'
            };
            this.activeGames.push(formattedGame);
          });
        } else {
          console.warn(`Ignoring update for ${packet.sportType} since current sport is ${this.selectedSport}`);
        }
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
    // sport comes in as one of the normalized values: "basketball-men", "basketball-women", "football"
    this.selectedSport = sport;
    this.activeGames = [];
    this.fetchActiveGames();

    console.log('Changing sport to:', sport);
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ type: 'sportChange', sportType: sport });
      console.log(`Sending sportChange to WebSocket: ${message}`);
      this.socket.send(message);
    } else {
      console.warn('WebSocket not open, reconnecting...');
      this.connectWebSocket();
    }
  }
}
