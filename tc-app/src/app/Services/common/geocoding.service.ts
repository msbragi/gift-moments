import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, map } from 'rxjs';

export interface GeocodingResult {
  street?: string;
  city?: string;
  country?: string;
  fullAddress?: string;
  success: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {
  constructor(private http: HttpClient) {}

  reverseGeocode(lat: number, lng: number): Observable<GeocodingResult> {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    
    return this.http.get<any>(url).pipe(
      map(response => {
        if (response && response.address) {
          const address = response.address;
          return {
            street: this.extractStreet(address),
            city: this.extractCity(address),
            country: address.country,
            fullAddress: response.display_name,
            success: true
          };
        }
        return { success: false };
      }),
      catchError(() => of({ success: false }))
    );
  }

  private extractStreet(address: any): string | undefined {
    return address.road || address.pedestrian || address.footway || address.path;
  }

  private extractCity(address: any): string | undefined {
    return address.city || address.town || address.village || address.municipality || address.county;
  }
}