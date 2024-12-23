import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, NgIf, NgFor],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  activeGames: any[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.fetchActiveGames();
  }

  fetchActiveGames() {
    this.http.get<any>('http://localhost:3000/api/games')
      .subscribe({
        next: (response) => {
          this.activeGames = response.activeGames || [];
        },
        error: (error) => {
          console.error('Error fetching active games:', error);
        }
      });
  }
}
