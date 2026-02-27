import { Injectable } from '@angular/core';
import { Observable, map, forkJoin } from 'rxjs';
import { IRecipient } from '../../Models/models.interface';
import { ApiService } from './api.service';
import { IResponse } from '../../Models/auth.interface';

@Injectable({
  providedIn: 'root'
})
export class RecipientsService {

  constructor(private apiService: ApiService) { }

  /**
   * Get all recipients for a specific capsule
   */
  getRecipientsByCapsule(capsuleId: number): Observable<IRecipient[]> {
    return this.apiService.get<IResponse>(`capsules/${capsuleId}/recipients`).pipe(
      map((response: IResponse) => response.data as IRecipient[])
    );
  }

  /**
   * Get a specific recipient by ID for a capsule
   */
  getRecipient(capsuleId: number, id: number): Observable<IRecipient> {
    return this.apiService.get<IResponse>(`capsules/${capsuleId}/recipients/${id}`).pipe(
      map((response: IResponse) => response.data as IRecipient)
    );
  }

  /**
   * Create a new recipient for a capsule
   */
  createRecipient(capsuleId: number, recipient: Partial<IRecipient>): Observable<IRecipient> {
    return this.apiService.post<IResponse>(`capsules/${capsuleId}/recipients`, recipient).pipe(
      map((response: IResponse) => response.data as IRecipient)
    );
  }

  /**
   * Update an existing recipient for a capsule
   */
  updateRecipient(capsuleId: number, recipient: IRecipient): Observable<IRecipient> {
    return this.apiService.put<IResponse>(`capsules/${capsuleId}/recipients/${recipient.id}`, recipient).pipe(
      map((response: IResponse) => response.data as IRecipient)
    );
  }

  /**
   * Delete a recipient from a capsule
   */
  deleteRecipient(capsuleId: number, id: number): Observable<any> {
    return this.apiService.delete<IResponse>(`capsules/${capsuleId}/recipients/${id}`).pipe(
      map((response: IResponse) => response.data)
    );
  }

  /**
   * Add multiple recipients at once to a capsule
   */
  addMultipleRecipients(capsuleId: number, emails: string[]): Observable<IRecipient[]> {
    const recipients = emails.map(email => ({
      capsuleId,
      email
    }));
    return forkJoin(
      recipients.map(recipient => this.createRecipient(capsuleId, recipient))
    );
  }

  /**
 * Notify a single recipient for a capsule
 */
  notifyRecipient(capsuleId: number, recipientId: number): Observable<any> {
    return this.apiService.post<IResponse>(
      `capsules/${capsuleId}/recipients/notify`,
      { capsuleId, recipientId }
    ).pipe(
      map((response: IResponse) => response.data)
    );
  }

  /**
   * Notify all recipients for a capsule
   */
  notifyAllRecipients(capsuleId: number): Observable<any> {
    return this.apiService.post<IResponse>(
      `capsules/${capsuleId}/recipients/notify-all`,
      { capsuleId }
    ).pipe(
      map((response: IResponse) => response.data)
    );
  }


}