import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { IEnrichedPlan } from '../../Models/subscription-ui-config.model';
import { SubscriptionEnrichmentService } from '../common/subscription-enrichment.service';

interface SubscriptionPlansResponse {
  data: any[];
  timestamp: string;
  path: string;
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionPlansService {
  constructor(
    private apiService: ApiService,
    private enrichmentService: SubscriptionEnrichmentService
  ) {}

  /**
   * Get all available subscription plans with UI enrichment
   */
  getPlans(): Observable<IEnrichedPlan[]> {
    return this.apiService.get<SubscriptionPlansResponse>('subscription-plans').pipe(
      map(response => this.enrichmentService.enrichPlans(response.data))
    );
  }

  /**
   * Get only active subscription plans with UI enrichment
   */
  getActivePlans(): Observable<IEnrichedPlan[]> {
    return this.apiService.get<SubscriptionPlansResponse>('subscription-plans/active').pipe(
      map(response => this.enrichmentService.enrichPlans(response.data))
    );
  }

  /**
   * Get only premium subscription plans (non-free) with UI enrichment
   */
  getPremiumPlans(): Observable<IEnrichedPlan[]> {
    return this.apiService.get<SubscriptionPlansResponse>('subscription-plans/premium').pipe(
      map(response => this.enrichmentService.enrichPlans(response.data))
    );
  }
}
