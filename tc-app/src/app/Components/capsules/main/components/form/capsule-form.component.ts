import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { Subscription } from 'rxjs';
import { MapLocation, MapLocationPickerComponent } from '../../../../../Features/map-location/map-location-picker.component';
import { ICapsule } from '../../../../../Models/models.interface';
import { CapsulesService } from '../../../../../Services/api/capsules.service';
import { SnackbarService } from '../../../../../Services/common/snackbar.service';
import { UI_CONSTANTS } from '../../../../shared/constants/ui-constants';

@Component({
  selector: 'tc-capsule-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatNativeDateModule,
    MatSelectModule,
    MatSlideToggleModule,
    TranslocoModule,
    MapLocationPickerComponent
  ],
  templateUrl: './capsule-form.component.html',
  styleUrl: './capsule-form.component.scss'
})
export class CapsuleFormComponent implements OnInit, OnDestroy {
  @Input() capsule?: ICapsule;
  @Output() formSubmitted = new EventEmitter<ICapsule>();
  @Output() formCancelled = new EventEmitter<void>();

  capsuleForm!: FormGroup;
  isSubmitting = false;
  minDate = new Date();
  uiConstants = UI_CONSTANTS;
  editMode = false;
  
  // Map related properties
  initialLocation?: MapLocation;
  
  private subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private capsulesService: CapsulesService,
    private snackBarService: SnackbarService,
    private translocoService: TranslocoService
  ) {}

  ngOnInit(): void {
    this.editMode = !!this.capsule;
    this.initForm();
    
    // Set initial location if available
    if (this.capsule && this.capsule.lat && this.capsule.lng) {
      this.initialLocation = {
        lat: parseFloat(this.capsule.lat),
        lng: parseFloat(this.capsule.lng)
      };
    }
    
    // Watch for manual coordinate changes
    this.watchCoordinateChanges();
  }
  
  /**
   * Watch for manual changes to lat/lng inputs to update map
   */
  private watchCoordinateChanges(): void {
    // Create a merged observable of both lat and lng changes
    const latChanges$ = this.capsuleForm.get('lat')!.valueChanges;
    const lngChanges$ = this.capsuleForm.get('lng')!.valueChanges;
    
    this.subscription.add(
      latChanges$.subscribe(() => this.updateLocationFromForm())
    );
    
    this.subscription.add(
      lngChanges$.subscribe(() => this.updateLocationFromForm())
    );
  }
  
  /**
   * Update the map location when form values change manually
   */
  private updateLocationFromForm(): void {
    const lat = this.capsuleForm.get('lat')!.value;
    const lng = this.capsuleForm.get('lng')!.value;
    
    // Only update if both values are valid numbers
    if (lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
      this.initialLocation = {
        lat: parseFloat(lat),
        lng: parseFloat(lng)
      };
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  initForm(): void {
    this.capsuleForm = this.fb.group({
      name: [this.capsule?.name || '', [Validators.required, Validators.maxLength(100)]],
      description: [this.capsule?.description || '', [Validators.required, Validators.maxLength(500)]],
      openDate: [this.capsule?.openDate || this.getDefaultOpenDate(), [Validators.required]],
      isPublic: [this.capsule?.isPublic || false],
      isPhysical: [this.capsule?.isPhysical || false],
      lat: [this.capsule?.lat || ''],
      lng: [this.capsule?.lng || '']
    });

    // Watch for changes to isPhysical to conditionally require lat/lng and show map
    this.subscription.add(
      this.capsuleForm.get('isPhysical')!.valueChanges.subscribe(isPhysical => {
        const latControl = this.capsuleForm.get('lat');
        const lngControl = this.capsuleForm.get('lng');
        
        if (isPhysical) {
          latControl?.setValidators([Validators.required]);
          lngControl?.setValidators([Validators.required]);
          
          // Automatically show the map when physical capsule is selected
          
          // Try to get user's current location if no location is set
          if ((!latControl?.value || !lngControl?.value) && this.initialLocation === undefined) {
            this.getCurrentLocation();
          }
        } else {
          latControl?.clearValidators();
          lngControl?.clearValidators();
          
          // Hide map when switching to digital capsule
        }
        
        latControl?.updateValueAndValidity();
        lngControl?.updateValueAndValidity();
      })
    );
  }

  getDefaultOpenDate(): Date {
    // Set default open date to 1 year from now
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date;
  }

  onSubmit(): void {
    if (this.capsuleForm.invalid) {
      this.capsuleForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    // Only edit is permitted
    const capsuleData: ICapsule = {
      id: this.capsule?.id || undefined,
      ...this.capsuleForm.value
    };
    this.formSubmitted.emit(capsuleData);
  }

  onCancel(): void {
    this.formCancelled.emit();
  }

  /**
   * Handle location changes from the map component
   */
  onLocationChange(location: MapLocation): void {
    // Format coordinates to 6 decimal places for precision
    const formattedLat = location.lat.toFixed(6);
    const formattedLng = location.lng.toFixed(6);
    
    // Update form controls with formatted location
    this.capsuleForm.patchValue({
      lat: formattedLat,
      lng: formattedLng
    });
  }
  
  /**
   * Get the user's current location from browser
   */
  getCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Update initialLocation with user's position
          this.initialLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          // Also update form values
          this.capsuleForm.patchValue({
            lat: position.coords.latitude.toFixed(6),
            lng: position.coords.longitude.toFixed(6)
          });
          
          // Show success message
          this.snackBarService.success(this.translocoService.translate('map.locationFound'));
        },
        (error) => {
          console.error('Error getting location:', error);
          this.snackBarService.error(this.translocoService.translate('map.locationError'));
        }
      );
    } else {
      this.snackBarService.error(this.translocoService.translate('map.geolocationNotSupported'));
    }
  }
}
