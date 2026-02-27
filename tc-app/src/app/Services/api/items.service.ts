import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { IItem, ILibraryItem } from '../../Models/models.interface';
import { ApiService } from './api.service';
import { IResponse } from '../../Models/auth.interface';

@Injectable({
  providedIn: 'root'
})
export class ItemsService {
  
  constructor(private apiService: ApiService) {}

  /**
   * Get all items for a specific capsule
   */
  getItems(capsuleId: number): Observable<IItem[]> {
    return this.apiService.get<IResponse>(`capsules/${capsuleId}/items`).pipe(
      map((response: IResponse) => response.data as IItem[])
    );
  }

  /**
   * Get a specific item from a capsule
   */
  getItem(capsuleId: number, itemId: number): Observable<IItem> {
    return this.apiService.get<IResponse>(`capsules/${capsuleId}/items/${itemId}`).pipe(
      map((response: IResponse) => response.data as IItem)
    );
  }

  /**
   * Add a new item to a capsule
   */
  addItem(capsuleId: number, item: Partial<IItem>): Observable<IItem> {
    return this.apiService.post<IResponse>(`capsules/${capsuleId}/items`, item).pipe(
      map((response: IResponse) => response.data as IItem)
    );
  }

  /**
   * Update an existing item in a capsule
   */
  updateItem(capsuleId: number, item: IItem): Observable<IItem> {
    return this.apiService.put<IResponse>(`capsules/${capsuleId}/items/${item.id}`, item).pipe(
      map((response: IResponse) => response.data as IItem)
    );
  }

  /**
   * Delete an item from a capsule
   */
  deleteItem(capsuleId: number, itemId: number): Observable<any> {
    return this.apiService.delete<IResponse>(`capsules/${capsuleId}/items/${itemId}`).pipe(
      map((response: IResponse) => response.data)
    );
  }

  /**
   * Upload file content to an item in a capsule
   */
  uploadItemContent(capsuleId: number, file: File, type: string): Observable<IItem> {
    const formData = new FormData();
    formData.append('content', file);
    formData.append('contentType', type);
    formData.append('name', file.name);

    return this.apiService.post<IResponse>(`capsules/${capsuleId}/items`, formData, undefined, true).pipe(
      map((response: IResponse) => response.data as IItem)
    );
  }

  /**
   * Add an item from the library to a capsule
   */
  addItemFromLibrary(capsuleId: number, item: ILibraryItem): Observable<IItem> {
    return this.apiService.post<IResponse>(`capsules/${capsuleId}/items/from-library/${item.id}`, {}).pipe(
      map((response: IResponse) => response.data as IItem)
    );
  }

  /**
   * Add an external URL to a capsule
   */
  addExternalUrlToLibrary(capsuleId: number, url: string, type: string, name?: string, size?: number): Observable<IItem> {
    const payload = {
      url,
      contentType: type,
      name: name || `External-${Date.now()}`,
      size: size || null
    };
    return this.apiService.post<IResponse>(`capsules/${capsuleId}/items/external`, payload).pipe(
      map((response: IResponse) => response.data as IItem)
    );
  }
}