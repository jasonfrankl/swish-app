import { Component } from '@angular/core';
// import { MapComponent } from './components/map/map.component';
import { HomeComponent } from "./components/home/home.component";
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HomeComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'forage-for-cool-bees';
}
