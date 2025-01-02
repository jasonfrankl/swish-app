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
    const wsUrl = `${scheme}://host.docker.internal:3000/ws`;  // Use Docker internal host for WebSocket

    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log('WebSocket connected.');
    };

    this.socket.onmessage = (event) => {
      const packet = JSON.parse(event.data);
      if (packet.label === 'init') {
        this.activeGames = packet.data;
      } else if (packet.label === 'chat') {
        console.log('Live update:', packet.data);

        const game = packet.data;

        // Ensure the structure is valid and handle missing fields
        const formattedGame = {
          homeTeam: game.homeTeam || 'Unknown Team',
          awayTeam: game.awayTeam || 'Unknown Team',
          homeScore: game.home?.score ?? 0,  // Use optional chaining and default to 0
          awayScore: game.away?.score ?? 0,  // Use optional chaining and default to 0
          currentPeriod: game.currentPeriod || 'N/A'
        };

        this.activeGames.push(formattedGame);
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
  }
}
