import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ILibraryItem } from '../../Models/models.interface';
import { ApiService } from './api.service';
import { IResponse } from '../../Models/auth.interface';

@Injectable({
  providedIn: 'root'
})
export class LibraryService {
  
  constructor(private apiService: ApiService) {}
  
  /**
   * Get all items in the user's library
   */
  getAllLibraryItems(): Observable<ILibraryItem[]> {
    return this.apiService.get<IResponse>('library/items').pipe(
      map((response: IResponse) => response.data as ILibraryItem[])
    );
  }

  /**
   * Get only unused library items (not attached to any capsule)
   */
  getUnusedLibraryItems(): Observable<ILibraryItem[]> {
    return this.apiService.get<IResponse>('library/items/unused').pipe(
      map((response: IResponse) => response.data as ILibraryItem[])
    );
  }

  /**
   * Get a specific library item
   * @param itemId The ID of the library item
   */
  getLibraryItem(itemId: number): Observable<ILibraryItem> {
    return this.apiService.get<IResponse>(`library/items/${itemId}`).pipe(
      map((response: IResponse) => response.data as ILibraryItem)
    );
  }
  
  /**
   * Get metadata for a specific library item
   * @param itemId The ID of the library item
   */
  getLibraryItemMetadata(itemId: number): Observable<any> {
    return this.apiService.get<IResponse>(`library/items/${itemId}/metadata`).pipe(
      map((response: IResponse) => response.data)
    );
  }
  
  /**
   * Add a new item to the library
   * @param item The library item data
   */
  addLibraryItem(item: Partial<ILibraryItem>): Observable<ILibraryItem> {
    return this.apiService.post<IResponse>('library/items', item).pipe(
      map((response: IResponse) => response.data as ILibraryItem)
    );
  }

  /**
   * Update an existing library item
   * @param item The library item data to update
   */
  updateLibraryItem(item: ILibraryItem): Observable<ILibraryItem> {
    return this.apiService.put<IResponse>(`library/items/${item.id}`, item).pipe(
      map((response: IResponse) => response.data as ILibraryItem)
    );
  }

  /**
   * Delete a library item
   * @param itemId The ID of the library item to delete
   */
  deleteLibraryItem(itemId: number): Observable<any> {
    return this.apiService.delete<IResponse>(`library/items/${itemId}`).pipe(
      map((response: IResponse) => response.data)
    );
  }
  
  /**
   * Upload a file to the library
   * @param file The file to upload
   * @param type The type of content being uploaded
   */
  uploadToLibrary(file: File, type: string): Observable<ILibraryItem> {
    const formData = new FormData();
    formData.append('content', file);
    formData.append('contentType', type);
    formData.append('name', file.name);
    
    return this.apiService.post<IResponse>('library/items', formData, undefined, true).pipe(
      map((response: IResponse) => response.data as ILibraryItem)
    );
  }
  
  /**
   * Add an external URL to the library
   * @param url The external URL
   * @param type The type of content
   */
  addExternalUrlToLibrary(url: string, type: string, name?: string, size?: number): Observable<ILibraryItem> {
    const payload = {
      url,
      contentType: type,
      name: name || `External-${Date.now()}`,
      size: size || null
    };
    
    return this.apiService.post<IResponse>('library/items/external', payload).pipe(
      map((response: IResponse) => response.data as ILibraryItem)
    );
  }
  
  /**
   * Get library items filtered by content type
   * @param type The content type to filter by
   */
  getLibraryItemsByType(type: string): Observable<ILibraryItem[]> {
    return this.getAllLibraryItems().pipe(
      map(items => items.filter(item => item.contentType === type))
    );
  }
}