import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IResponse } from '../../Models/auth.interface';
import { IUsageResponse } from '../../Models/subscriptions.model';
import { ApiService } from './api.service';
import { IPaymentGateway } from '../../Models/payment-gateway.interface';

export interface ISusbscriptionGateway {
    code: string;
    name: string;
    displayName: string;
    logo: string;
}


@Injectable({
  providedIn: 'root'
})
export class SubscriptionsService {
  constructor(
    private apiService: ApiService
  ) { }

  createSubscription(type: string, gwCode?: string): Observable<any> {
    if (type === 'free') {
      return this.apiService.get<IResponse>('subscriptions/free').pipe(
        map((response: IResponse) => {
          return response.data;
        })
      );
    } else {
      const data = {
        planName: type,
        gwCode: gwCode
      }
      return this.apiService.post<IResponse>('subscriptions/pay', data).pipe(
        map((response: IResponse) => {
          return response.data;
        })
      );
    }
  }

  /**
   * Get current user subscription usage status for all capsules with UI enrichment
   */
  getCapsuleUsageStatus(): Observable<IUsageResponse[]> {
    return this.apiService.get<IResponse>('subscriptions/usage').pipe(
      map((response: IResponse) => {
        return response.data;
      })
    );
  }

  /**
   * Get available payment gateways
   */
  getPaymentGateways(): Observable<ISusbscriptionGateway[]> {
    return this.apiService.get<IResponse>(`subscriptions/payment-gateways`).pipe(
      map((response: IResponse) => {
        return response.data;
      })
    );
  }

}
