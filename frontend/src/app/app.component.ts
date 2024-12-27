import { Component } from '@angular/core';
// import { MapComponent } from './components/map/map.component';
// import { HomeComponent } from "./components/home/home.component";
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'box-score-notification-app';
}
