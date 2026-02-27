import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import * as L from 'leaflet';

export interface MapLocation {
  lat: number;
  lng: number;
}

@Component({
  selector: 'tc-map-location-picker',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatInputModule,
    MatIconModule,
    TranslocoModule
  ],
  template: `
    <div *transloco="let t; read: 'map'">
      <div class="map-container" [class.fullscreen]="isFullscreen">
        <div id="map" class="map"></div>
        <div class="map-controls">
          <button mat-icon-button 
            color="primary" 
            [matTooltip]="t('useMyLocation')" 
            (click)="useCurrentLocation($event)">
            <mat-icon>my_location</mat-icon>
          </button>
          <button mat-icon-button 
            color="primary" 
            [matTooltip]="t('reset')" 
            (click)="resetView($event)">
            <mat-icon>refresh</mat-icon>
          </button>
          <button mat-icon-button 
            color="primary" 
            [matTooltip]="isFullscreen ? t('exitFullscreen') : t('fullscreen')" 
            (click)="toggleFullscreen($event)">
            <mat-icon>{{ isFullscreen ? 'fullscreen_exit' : 'fullscreen' }}</mat-icon>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .map-container {
      position: relative;
      height: 300px;
      width: 100%;
      border-radius: 4px;
      margin-bottom: 16px;
      transition: all 0.3s ease;
    }
    
    .map-container.fullscreen {
      position: fixed;
      top: 50px;
      left: 0;
      width: 100vw;
      height: calc(100vh - 50px);
      z-index: 9999;
      margin: 0;
      border-radius: 0;
      background-color: white;
      padding: 0;
    }
    
    .map {
      height: 100%;
      z-index: 1;
    }
    
    .map-controls {
      position: absolute;
      top: 10px;
      right: 90px; /* Position even further right to avoid overlap with zoom controls */
      z-index: 2;
      background-color: rgba(255, 255, 255, 0.8);
      border-radius: 4px;
      display: flex;
      gap: 4px;
    }
  `]
})
export class MapLocationPickerComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @Input() initialLocation?: MapLocation;
  @Output() locationChange = new EventEmitter<MapLocation>();

  private map?: L.Map;
  private marker?: L.Marker;
  private defaultLocation: MapLocation = { lat: 45.4642, lng: 9.1900 }; // Milan, Italy as default
  isFullscreen = false;
  
  // Reference to event listener for cleanup
  private escapeListener: ((event: KeyboardEvent) => void) | null = null;
  // Store translation for popup
  private capsuleLocationText = '';
  
  constructor(private translocoService: TranslocoService) {
    // Get translation for capsule location text
    this.capsuleLocationText = this.translocoService.translate('map.capsuleLocation');
  }
  
  ngOnInit(): void {
    this.fixLeafletIconReferences();
    
    // Add escape key listener for exiting fullscreen
    this.escapeListener = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && this.isFullscreen) {
        this.toggleFullscreen();
      }
    };
    
    document.addEventListener('keydown', this.escapeListener);
  }

  ngAfterViewInit(): void {
    this.initMap();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    // If initialLocation changed after map was initialized, update marker position
    if (changes['initialLocation'] && !changes['initialLocation'].firstChange && this.map && this.marker) {
      const newLocation = changes['initialLocation'].currentValue;
      if (newLocation) {
        this.updateMarkerPosition(newLocation);
      }
    }
  }
  
  ngOnDestroy(): void {
    // Remove the map
    if (this.map) {
      this.map.remove();
    }
    
    // Clean up event listeners
    if (this.escapeListener) {
      document.removeEventListener('keydown', this.escapeListener);
      this.escapeListener = null;
    }
  }

  private initMap(): void {
    // Use initial location or default
    const location = this.initialLocation || this.defaultLocation;
    
    // Create map with zoom controls on the right side and touch zoom enabled
    this.map = L.map('map', {

      zoomControl: true,
      touchZoom: true,
      dragging: true,
      tapHold: true,
      zoomSnap: 0.5,
      zoomDelta: 0.5
    }).setView([location.lat, location.lng], 13);
    
    // Move zoom control to the right top corner for better UX
    this.map.zoomControl.setPosition('topright');
    
    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Add marker at initial position with popup
    this.marker = L.marker([location.lat, location.lng], {
      draggable: true
    })
      .addTo(this.map)
      .bindPopup(this.capsuleLocationText)
      .openPopup();

    // Update coordinates when marker is dragged
    this.marker.on('dragend', (event: any) => {
      const position = event.target.getLatLng();
      const newLocation: MapLocation = {
        lat: position.lat,
        lng: position.lng
      };
      
      // Update popup content with new coordinates
      this.marker?.setPopupContent(`${this.capsuleLocationText}<br>Lat: ${position.lat.toFixed(6)}<br>Lng: ${position.lng.toFixed(6)}`);
      
      this.locationChange.emit(newLocation);
    });

    // Allow clicking on the map to set marker
    this.map.on('click', (e: any) => {
      const clickedLocation = e.latlng;
      this.marker?.setLatLng(clickedLocation);
      
      // Update popup content with new coordinates
      this.marker?.setPopupContent(`${this.capsuleLocationText}<br>Lat: ${clickedLocation.lat.toFixed(6)}<br>Lng: ${clickedLocation.lng.toFixed(6)}`);
      this.marker?.openPopup();
      
      const newLocation: MapLocation = {
        lat: clickedLocation.lat,
        lng: clickedLocation.lng
      };
      this.locationChange.emit(newLocation);
    });
  }
  
  // Fix for Leaflet marker icons not showing in Angular
  private fixLeafletIconReferences(): void {
    // Delete default icon references
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    
    // Configure path manually
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
      iconUrl: 'assets/leaflet/marker-icon.png',
      shadowUrl: 'assets/leaflet/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  }
  
  // Reset map view to initial location
  public resetView(event?: MouseEvent): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    const location = this.initialLocation || this.defaultLocation;
    this.map?.setView([location.lat, location.lng], 13);
    this.marker?.setLatLng([location.lat, location.lng]);
  }
  
  // Update the marker position programmatically
  public updateMarkerPosition(location: MapLocation): void {
    if (this.map && this.marker) {
      this.marker.setLatLng([location.lat, location.lng]);
      this.map.setView([location.lat, location.lng], 13);
      
      // Update popup content with new coordinates
      this.marker.setPopupContent(`${this.capsuleLocationText}<br>Lat: ${location.lat.toFixed(6)}<br>Lng: ${location.lng.toFixed(6)}`);
      this.marker.openPopup();
    }
  }

  /**
   * Toggle fullscreen mode for the map
   * @param event The mouse event to stop propagation
   */
  toggleFullscreen(event?: MouseEvent): void {
    // Stop event propagation to prevent closing the form
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    this.isFullscreen = !this.isFullscreen;
    
    // Need to update the map size after toggling fullscreen
    // to ensure it fills the available space correctly
    setTimeout(() => {
      if (this.map) {
        // Force a complete redraw by invalidating size and triggering a recenter
        this.map.invalidateSize({ pan: false, animate: false, debounceMoveend: true });
        
        // Additional timeout for browsers that need more time to recalculate dimensions
        setTimeout(() => {
          this.map?.invalidateSize();
          
          // If we have a marker, ensure it's centered in view
          if (this.marker) {
            const position = this.marker.getLatLng();
            this.map?.setView([position.lat, position.lng], this.map.getZoom());
          }
        }, 300);
      }
    }, 100);
  }
  
  /**
   * Use browser geolocation to set current location
   * @param event The mouse event to stop propagation
   */
  useCurrentLocation(event?: MouseEvent): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: MapLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          // Update map and marker
          this.updateMarkerPosition(location);
          
          // Specifically center the map on the new location with a slightly higher zoom level
          if (this.map) {
            this.map.setView([location.lat, location.lng], 15);
          }
          
          // Emit location change
          this.locationChange.emit(location);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }
}
