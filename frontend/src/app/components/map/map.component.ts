import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, NgIf } from '@angular/common';

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: `./map.component.html`,
  styleUrls: ['./map.component.css'],
  imports: [NgIf],
})
export class MapComponent implements OnInit {
  isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  async ngOnInit() {
    if (this.isBrowser) {
      const L = await import('leaflet');

      L.Icon.Default.mergeOptions({
        iconRetinaUrl: '../assets/leaflet/marker-icon-2x.png',
        iconUrl: '../assets/leaflet/marker-icon.png',
        shadowUrl: '../assets/leaflet/marker-shadow.png',
      });
      const map = L.map('map').setView([39.8283, -98.5795], 5);

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      // Add a marker
      L.marker([39.8283, -98.5795]).addTo(map).bindPopup('Hive Location');
    }
  }
}
