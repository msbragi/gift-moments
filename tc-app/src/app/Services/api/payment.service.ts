import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { IResponse } from '../../Models/auth.interface';

export interface PaymentRequest {
  subscriptionPlanId: number;
  gatewayCode: 'stripe' | 'paypal';
  amountCents: number;
  currencyCode?: string;
}

export interface PaymentResult {
  transactionId: number;
  gatewayTransactionId?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  redirectUrl?: string; // For PayPal
  clientSecret?: string; // For Stripe
}

export interface PaymentTransaction {
  id: number;
  userId: number;
  subscriptionPlanId: number;
  gatewayCode: string;
  gatewayTransactionId?: string;
  amountCents: number;
  currencyCode: string;
  status: string;
  failureReason?: string;
  processedAt?: Date;
  createdAt: Date;
  subscriptionPlan?: {
    id: number;
    name: string;
    displayName: string;
    priceMonthly: number;
    priceYearly: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  constructor(private apiService: ApiService) {}

  /**
   * Process a subscription payment
   */
  processPayment(request: PaymentRequest): Observable<PaymentResult> {
    return this.apiService.post<IResponse>('payments/process', request)
      .pipe(
        map((response: IResponse) => response.data as PaymentResult)
      );
  }

  /**
   * Get user's payment transactions
   */
  getUserTransactions(): Observable<PaymentTransaction[]> {
    return this.apiService.get<IResponse>('payments/transactions')
      .pipe(
        map((response: IResponse) => {
          const transactions = response.data as PaymentTransaction[];
          // Parse dates
          return transactions.map(t => ({
            ...t,
            processedAt: t.processedAt ? new Date(t.processedAt) : undefined,
            createdAt: new Date(t.createdAt)
          }));
        })
      );
  }

  /**
   * Format amount for display
   */
  formatAmount(amountCents: number, currencyCode: string = 'USD'): string {
    const amount = amountCents / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode
    }).format(amount);
  }

  /**
   * Get status color for UI
   */
  getStatusColor(status: string): 'primary' | 'accent' | 'warn' {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'primary';
      case 'pending':
        return 'accent';
      case 'failed':
      case 'cancelled':
        return 'warn';
      default:
        return 'accent';
    }
  }

  /**
   * Get readable status text
   */
  getStatusText(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Processing...';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      case 'cancelled':
        return 'Cancelled';
      case 'refunded':
        return 'Refunded';
      default:
        return status;
    }
  }
}
