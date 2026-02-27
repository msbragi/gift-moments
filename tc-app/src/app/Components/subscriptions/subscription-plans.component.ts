import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { Observable, Subject, combineLatest } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';
import { IEnrichedPlan } from '../../Models/subscription-ui-config.model';
import { AuthService } from '../../Services/api/auth.service';
import { SubscriptionPlansService } from '../../Services/api/subscription-plans.service';
import { SubscriptionsService } from '../../Services/api/subscriptions.service';
import { SnackbarService } from '../../Services/common/snackbar.service';
import { SubscriptionEnrichmentService } from '../../Services/common/subscription-enrichment.service';
import { PaymentDialogComponent } from '../payments/payment-dialog.component';
import { MatDialog } from '@angular/material/dialog';

interface SubscriptionPlansState {
  plans: IEnrichedPlan[];
  currentUser: any;
}

@Component({
  selector: 'app-subscription-plans',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    TranslocoDirective
  ],
  templateUrl: './subscription-plans.component.html',
  styleUrls: ['./subscription-plans.component.scss']
})
export class SubscriptionPlansComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  state$: Observable<SubscriptionPlansState> | undefined;

  constructor(
    private subscriptionPlansService: SubscriptionPlansService,
    private subscriptionService: SubscriptionsService,
    private authService: AuthService,
    private snackbar: SnackbarService,
    private router: Router,
    private dialog: MatDialog,
    private enrichmentService: SubscriptionEnrichmentService
  ) { }

  ngOnInit(): void {
    const user$ = this.authService.currentUser$;
    const plans$ = this.subscriptionPlansService.getPlans();
    this.state$ = combineLatest([
      user$,
      plans$
    ]).pipe(
      takeUntil(this.destroy$),
      tap(([user, plans]) => {
        console.log('Subscription plans state initialized:', { user, plans });
      }),
      // Enrich plans and filter based on user
      map(([user, plans]) => ({
        plans: this.filterPlansForUser(plans, user),
        currentUser: user
      }))
    );
  }

  /**
   * Filter plans based on user's current subscriptions
   */
  private filterPlansForUser(plans: IEnrichedPlan[], user: any): IEnrichedPlan[] {
    if (!user) {
      return plans; // Show all plans for guest users
    }

    // Filter out Free plan if user already has one
    return plans.filter(plan => {
      // If it's a Free plan (name = 'free'), check if user already has one
      if (plan.name === 'free' && this.userHasFreePlan(user)) {
        return false; // Hide Free plan
      }
      return true; // Show all other plans
    });
  }

  /**
   * Check if user already has a Free plan
   */
  userHasFreePlan(user: any): boolean {
    if (!user || !user.subscriptions) {
      return false; // No user or no subscriptions
    }
    return true;
  }

  /**
   * Get message to show when Free plan is hidden
   */
  getFreePlanHiddenMessage(): string {
    return 'You already have a Free capsule. Only one Free capsule is allowed per user.';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSelectPlan(plan: IEnrichedPlan): void {
    switch (plan.name) {
      case 'free':
        this.subscriptionService.createSubscription('free').subscribe((data: any) => {
          if (data) {
            this.router.navigate(['/capsules']);
          }
        });
        break;
        // Open payment dialog for paid plans
      default:
        this.dialog.open(PaymentDialogComponent, {
          data: { plan },
          width: '800px',
          maxWidth: '90vw',
          disableClose: true
        });
        break;
    }
  }

  trackByPlan(index: number, plan: IEnrichedPlan): number {
    return plan.id;
  }

  trackByLimitKey(index: number, limitKey: string): string {
    return limitKey;
  }

  trackByFeatureKey(index: number, featureKey: string): string {
    return featureKey;
  }

  getObjectKeys(obj: any): string[] {
    return Object.keys(obj || {});
  }

  getLimitDisplayText(limitKey: string, maxValue: number): string {
    return this.enrichmentService.getLimitDisplayText(limitKey, maxValue);
  }

  getFeatureDisplayText(featureKey: string): string {
    return this.enrichmentService.getFeatureDisplayText(featureKey);
  }

}
