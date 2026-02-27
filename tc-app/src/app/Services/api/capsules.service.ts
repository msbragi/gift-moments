import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { IResponse } from '../../Models/auth.interface';
import { ICapsule } from '../../Models/models.interface';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class CapsulesService {
  
  constructor(private apiService: ApiService) {}
  
 /**
   * Load all capsules for the current user
   */
 getCapsules(): Observable<ICapsule[]> {
    return this.apiService.get<IResponse>('capsules').pipe(
      map((response: IResponse) => response.data as ICapsule[])
    );
  }

 /**
   * Load all capsules assigned to the current user (alias for getCapsules)
   */
 getAssignedCapsules(): Observable<ICapsule[]> {
    return this.apiService.get<IResponse>('capsules/assigned').pipe(
      map((response: IResponse) => response.data as ICapsule[])
    );
  }

 /**
   * Load all public capsules
   */
 getPublicCapsules(): Observable<ICapsule[]> {
    return this.apiService.get<IResponse>('capsules/public').pipe(
      map((response: IResponse) => response.data as ICapsule[])
    );
  }

  /**
   * Get a specific capsule by ID
   */
  getCapsule(id: number): Observable<ICapsule> {
    return this.apiService.get<IResponse>(`capsules/${id}`).pipe(
      map((response: IResponse) => response.data as ICapsule)
    );
  }
  
  /**
   * Create a new capsule
   */
  createCapsule(capsule: Partial<ICapsule>): Observable<ICapsule> {
    return this.apiService.post<IResponse>('capsules', capsule).pipe(
      map((response: IResponse) => response.data as ICapsule)
    );
  }

  /**
   * Update an existing capsule
   */
  updateCapsule(capsule: ICapsule): Observable<ICapsule> {
    return this.apiService.put<IResponse>(`capsules/${capsule.id}`, capsule).pipe(
      map((response: IResponse) => response.data as ICapsule)
    );
  }

  /**
   * Delete a capsule
   */
  deleteCapsule(id: number): Observable<any> {
    return this.apiService.delete<IResponse>(`capsules/${id}`).pipe(
      map((response: IResponse) => response.data)
    );
  }
}