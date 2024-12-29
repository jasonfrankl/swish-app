import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import { CommonModule } from '@angular/common';
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
export class HomeComponent implements OnInit {
  activeGames: any[] = [];
  loading: boolean = false;
  loadingApp: boolean = false;

  selectedSport = 'college-basketball';
  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.fetchActiveGames();
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
    switch (sport) {
      case "college-basketball":
        return 'http://localhost:3000/api/college-basketball/active-games';
      case "college-basketball-women":
        return 'http://localhost:3000/api/college-basketball-women/active-games';
      case "college-football":
        return 'http://localhost:3000/api/college-football/active-games'
      default:
        return 'http://localhost:3000/api/college-basketball/active-games'

    }
  }

  onSportChange(sport: string) {
    this.selectedSport = sport;
    this.fetchActiveGames();
  }
}
