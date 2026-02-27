import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule } from '@jsverse/transloco';
import { Subject, takeUntil } from 'rxjs';
import { MapLocation, MapLocationPickerComponent } from '../../../../Features/map-location/map-location-picker.component';
import { ICapsule } from '../../../../Models/models.interface';
import { GeocodingResult, GeocodingService } from '../../../../Services/common/geocoding.service';
import { ShareService } from '../../../../Services/common/share.service';

@Component({
  selector: 'tc-capsule-explorer-map',
  standalone: true,
  imports: [
    CommonModule,
    TranslocoModule,
    MatCardModule,
    MatIconModule,
    MatTooltipModule,
    MapLocationPickerComponent
  ],
  templateUrl: './capsule-explorer-map.component.html',
  styleUrl: './capsule-explorer-map.component.scss'
})
export class CapsuleExplorerMapComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @Input() lat?: string;
  @Input() lng?: string;
  @Input() capsule?: ICapsule; // Add capsule input to check time-lock status
  @ViewChild(MapLocationPickerComponent) mapPicker!: MapLocationPickerComponent;

  mapLocation: MapLocation | undefined = undefined;
  addressInfo: GeocodingResult | null = null;
  isLoadingAddress = false;
  
  // Fixed default location to prevent change detection issues
  private readonly _defaultLocation: MapLocation = { lat: 45.4642, lng: 9.1900 }; // Milan, Italy as default
  private _isTimeLocked: boolean = false;
  private _formattedOpenDate: string = '';
  private _locationDisplay: string = '';
  private _addressDisplay: string = '';
  
  private destroy$ = new Subject<void>();

  constructor(
    private geocodingService: GeocodingService,
    private shareService: ShareService
  ) {}

  ngOnInit(): void {
    this.updateTimeLockStatus();
    this.updateLocationDisplay();
    this.updateMapLocation();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['capsule']) {
      this.updateTimeLockStatus();
    }
    
    if (changes['lat'] || changes['lng']) {
      this.updateLocationDisplay();
      this.updateMapLocation();
    }
  }

  private updateMapLocation(): void {
    if (this.lat && this.lng) {
      const newLat = parseFloat(this.lat);
      const newLng = parseFloat(this.lng);
      
      // Only update mapLocation if coordinates actually changed
      if (!this.mapLocation || this.mapLocation.lat !== newLat || this.mapLocation.lng !== newLng) {
        this.mapLocation = {
          lat: newLat,
          lng: newLng
        };
        this.loadAddressInfo();
      }
    } else {
      this.mapLocation = undefined;
    }
  }

  ngAfterViewInit(): void {
    if (this.mapPicker) {
      this.makeMapReadOnly();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateTimeLockStatus(): void {
    if (!this.capsule || !this.capsule.isPhysical || !this.capsule.openDate) {
      this._isTimeLocked = false;
      this._formattedOpenDate = '';
      return;
    }
    
    const openDate = new Date(this.capsule.openDate);
    const now = new Date();
    this._isTimeLocked = openDate > now;
    this._formattedOpenDate = openDate.toLocaleDateString();
  }

  private updateLocationDisplay(): void {
    if (!this.hasValidLocation()) {
      this._locationDisplay = '';
      return;
    }
    this._locationDisplay = `${parseFloat(this.lat!).toFixed(6)}, ${parseFloat(this.lng!).toFixed(6)}`;
  }

  private updateAddressDisplay(): void {
    if (!this.addressInfo?.success) {
      this._addressDisplay = '';
      return;
    }
    
    const parts = [];
    if (this.addressInfo.street) parts.push(this.addressInfo.street);
    if (this.addressInfo.city) parts.push(this.addressInfo.city);
    if (this.addressInfo.country) parts.push(this.addressInfo.country);
    
    this._addressDisplay = parts.join(', ') || this.addressInfo.fullAddress || '';
  }

  hasValidLocation(): boolean {
    return !!(this.lat && this.lng && !isNaN(parseFloat(this.lat)) && !isNaN(parseFloat(this.lng)));
  }

  isTimeLocked(): boolean {
    return this._isTimeLocked;
  }

  get defaultLocation(): MapLocation {
    // Return the fixed default location to prevent change detection issues
    return this._defaultLocation;
  }

  getFormattedOpenDate(): string {
    return this._formattedOpenDate;
  }

  private loadAddressInfo(): void {
    if (!this.hasValidLocation()) return;
    
    this.isLoadingAddress = true;
    const lat = parseFloat(this.lat!);
    const lng = parseFloat(this.lng!);
    
    this.geocodingService.reverseGeocode(lat, lng)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.addressInfo = result;
          this.isLoadingAddress = false;
          this.updateAddressDisplay();
        },
        error: () => {
          this.isLoadingAddress = false;
          this.updateAddressDisplay();
        }
      });
  }

  private makeMapReadOnly(): void {
    // Add a longer delay to ensure the map is fully initialized
    setTimeout(() => {
      const mapPicker = this.mapPicker as any;
      if (mapPicker && mapPicker.map) {
        try {
          // Disable all map interactions
          mapPicker.map.dragging?.disable();
          mapPicker.map.touchZoom?.disable();
          mapPicker.map.doubleClickZoom?.disable();
          mapPicker.map.scrollWheelZoom?.disable();
          mapPicker.map.boxZoom?.disable();
          mapPicker.map.keyboard?.disable();
          
          // Remove any existing markers for time-locked maps
          if (this.isTimeLocked() && mapPicker.marker) {
            mapPicker.map.removeLayer(mapPicker.marker);
          }
          
          // Hide controls safely
          const mapElement = mapPicker.map.getContainer();
          if (mapElement) {
            const controls = mapElement.querySelector('.map-controls') as HTMLElement;
            if (controls) {
              controls.style.display = 'none';
            }
          }
        } catch (error) {
          console.warn('Error making map read-only:', error);
        }
      }
    }, 1000); // Increased timeout to 1 second
  }

  getLocationDisplay(): string {
    return this._locationDisplay;
  }

  getAddressDisplay(): string {
    return this._addressDisplay;
  }

  showQRCode(): void {
    if (!this.hasValidLocation()) return;
    
    const lat = parseFloat(this.lat!);
    const lng = parseFloat(this.lng!);
    this.shareService.showLocationQRCode(lat, lng, 'Gift Capsule Location');
  }

  copyLocationToClipboard(): void {
    if (!this.hasValidLocation()) return;
    
    const lat = parseFloat(this.lat!);
    const lng = parseFloat(this.lng!);
    this.shareService.copyLocation(lat, lng, 'Gift Capsule Location');
  }

  shareLocation(): void {
    if (!this.hasValidLocation()) return;
    
    const lat = parseFloat(this.lat!);
    const lng = parseFloat(this.lng!);
    this.shareService.shareLocation(lat, lng, 'Gift Capsule Location');
  }
}