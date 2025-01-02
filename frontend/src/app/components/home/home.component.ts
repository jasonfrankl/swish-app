import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { LoadingComponent } from '../loading/loading.component';
import { io, Socket } from 'socket.io-client';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, NgIf, NgFor, LoadingComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  activeGames: any[] = [];
  loading: boolean = false;
  loadingApp: boolean = false;
  private socket!: Socket;


  selectedSport = 'college-basketball';
  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.fetchActiveGames();

    // Prevent WebSocket initialization during SSR
    if (typeof window !== 'undefined') {
      this.socket = io('http://backend:3000');

      // Listen for live score updates
      this.socket.on('scoreUpdate', (games) => {
        console.log('Live score updates:', games);
        this.activeGames = games;
      });

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection failed:', error);
      });
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
    // Detect if running in SSR (server) or CSR (browser)
    const isServer = typeof window === 'undefined';
    const apiBaseUrl = isServer
      ? 'http://localhost:3000'  // Use absolute URL during SSR
      : '';                      // Use relative URL for client-side rendering (CSR)

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


  onSportChange(sport: string) {
    this.selectedSport = sport;
    this.fetchActiveGames();
  }
}
