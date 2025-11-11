import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoadingComponent } from '../loading/loading.component';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, NgIf, NgFor, LoadingComponent, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  activeGames: any[] = [];
  filteredGames: any[] = [];
  favoriteGames: any[] = [];
  loading: boolean = false;
  loadingApp: boolean = false;
  socket!: WebSocket;
  reconnectTimeout: any;
  searchQuery: string = '';

  // Set the selectedSport to a normalized API value
  selectedSport: string = 'basketball-men';

  constructor(private http: HttpClient, private notificationService: NotificationService) {
    // Initialize filteredGames to match activeGames initially
    this.filteredGames = [...this.activeGames];
  }

  ngOnInit() {
    // this.fetchActiveGames();
    this.loadFavorites();
    this.connectWebSocket();
    console.log("TEST");
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
        this.activeGames = (response.activeGames || []).map((game: any) => ({
          ...game,
          id: this.generateGameId(game.homeTeam || 'Unknown Team', game.awayTeam || 'Unknown Team')
        }));
        this.applyFilters();
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
          // Instead of updating immediately, wait 300ms before updating.
          setTimeout(() => {
            this.activeGames = []; // Clear current games
            const incomingGames = Array.isArray(packet.data) ? packet.data : [packet.data];
            incomingGames.forEach((newGame: any) => {
              const formattedGame = {
                homeTeam: newGame.homeTeam || 'Unknown Team',
                awayTeam: newGame.awayTeam || 'Unknown Team',
                homeScore: newGame.score?.home ?? 0,
                awayScore: newGame.score?.away ?? 0,
                currentPeriod: newGame.currentPeriod || 'N/A',
                gameClock: newGame.gameClock || '00:00',
                id: this.generateGameId(newGame.homeTeam || 'Unknown Team', newGame.awayTeam || 'Unknown Team')
              };
              this.activeGames.push(formattedGame);

              // Check if this is a favorite game and notify of score changes
              const gameId = formattedGame.id;
              const favoriteIndex = this.favoriteGames.findIndex(fav =>
                this.generateGameId(fav.homeTeam, fav.awayTeam) === gameId
              );
              if (favoriteIndex > -1) {
                // Update favorite game
                this.favoriteGames[favoriteIndex] = { ...formattedGame };
                this.saveFavorites();

                // Check for score change and notify
                if (this.notificationService.hasScoreChanged(
                  gameId,
                  formattedGame.homeScore,
                  formattedGame.awayScore
                )) {
                  this.notificationService.notifyScoreChange({
                    gameId: gameId,
                    homeTeam: formattedGame.homeTeam,
                    awayTeam: formattedGame.awayTeam,
                    homeScore: formattedGame.homeScore,
                    awayScore: formattedGame.awayScore,
                    currentPeriod: formattedGame.currentPeriod,
                    gameClock: formattedGame.gameClock
                  });
                }
              }
            });
            this.applyFilters();
          }, 300);
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

  // Search functionality
  onSearchChange() {
    this.applyFilters();
  }

  applyFilters() {
    this.filteredGames = this.activeGames.filter(game => {
      if (this.searchQuery.trim() === '') {
        return true;
      }
      const query = this.searchQuery.toLowerCase();
      return game.homeTeam.toLowerCase().includes(query) ||
        game.awayTeam.toLowerCase().includes(query);
    });
  }

  // Favorites functionality
  generateGameId(homeTeam: string, awayTeam: string): string {
    return `${homeTeam}_${awayTeam}`;
  }

  isFavorite(game: any): boolean {
    const gameId = this.generateGameId(game.homeTeam, game.awayTeam);
    return this.favoriteGames.some(fav =>
      this.generateGameId(fav.homeTeam, fav.awayTeam) === gameId
    );
  }

  async toggleFavorite(game: any) {
    const gameId = this.generateGameId(game.homeTeam, game.awayTeam);
    const favoriteIndex = this.favoriteGames.findIndex(fav =>
      this.generateGameId(fav.homeTeam, fav.awayTeam) === gameId
    );

    if (favoriteIndex > -1) {
      // Remove from favorites
      this.favoriteGames.splice(favoriteIndex, 1);
      // Clear cache for this game
      this.notificationService.clearGameCache(gameId);
    } else {
      // Add to favorites - request notification permission
      this.favoriteGames.push({ ...game });
      // Cache the current score to avoid notifying on initial load
      this.notificationService.cacheGameScore(gameId, game.homeScore, game.awayScore);
      // Request notification permission once
      await this.notificationService.requestNotificationPermission();
    }
    this.saveFavorites();
  }

  loadFavorites() {
    const saved = localStorage.getItem('favoriteGames');
    if (saved) {
      try {
        this.favoriteGames = JSON.parse(saved);
      } catch (e) {
        console.error('Error loading favorites:', e);
        this.favoriteGames = [];
      }
    }
  }

  saveFavorites() {
    localStorage.setItem('favoriteGames', JSON.stringify(this.favoriteGames));
  }

  removeFavorite(game: any) {
    const gameId = this.generateGameId(game.homeTeam, game.awayTeam);
    this.favoriteGames = this.favoriteGames.filter(fav =>
      this.generateGameId(fav.homeTeam, fav.awayTeam) !== gameId
    );
    // Clear cache for this game
    this.notificationService.clearGameCache(gameId);
    this.saveFavorites();
  }
}
