import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

/**
 * Service for retrieving content by ID from library or capsule item
 */
@Injectable({
    providedIn: 'root'
})
export class ContentsService {

    constructor(private apiService: ApiService) { }

    /**
     * Get content for a library item by content ID
     */
    getLibraryItemContent(contentId: number): Observable<Blob> {
        return this.apiService.getBinary(`library/items/content/${contentId}`);
    }

    /**
     * Get content for a capsule item by capsule, item and content ID
     */
    getCapsuleItemContent(capsuleId: number, itemId: number, contentId: number): Observable<Blob> {
        return this.apiService.getBinary(`capsules/${capsuleId}/items/${itemId}/content/${contentId}`);
    }
}