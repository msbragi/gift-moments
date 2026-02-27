import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ICapsuleUsageResponse } from '../../Models/subscription-ui-config.model';
import { DateFormatPipe } from '../../Pipes/date-format.pipe';
import { SubscriptionsService } from '../../Services/api/subscriptions.service';
import { SubscriptionEnrichmentService } from '../../Services/common/subscription-enrichment.service';

@Component({
  selector: 'app-subscription-status',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
    RouterModule,
    TranslocoDirective,
    DateFormatPipe
  ],
  templateUrl: './subscription-status.component.html',
  styleUrls: ['./subscription-status.component.scss']
})
export class SubscriptionStatusComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  usageData: ICapsuleUsageResponse[] = [];
  loading = false;
  error = false;
  constructor(
    public subscriptionsService: SubscriptionsService,
    public enrichmentService: SubscriptionEnrichmentService
  ) {}

  ngOnInit(): void {
    this.loadUsageData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsageData(): void {
    this.loading = true;
    this.error = false;

    this.subscriptionsService.getCapsuleUsageStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.usageData = this.enrichmentService.enrichUsageArray(data);
        this.loading = false;
      });
  }

  // Helper methods for template
  getObjectKeys(obj: any): string[] {
    return Object.keys(obj || {});
  }

  getUtilizationPercentage(capsule: ICapsuleUsageResponse, metricKey: string): number {
    return this.enrichmentService.calculateUtilizationPercentage(capsule, metricKey);
  }

  hasReachedLimit(capsule: ICapsuleUsageResponse, metricKey: string): boolean {
    return this.enrichmentService.hasReachedLimit(capsule, metricKey);
  }

  getStatusColor(percentage: number): 'primary' | 'accent' | 'warn' {
    return this.enrichmentService.getStatusColor(percentage);
  }

  formatLimit(limit: number): string {
    return this.enrichmentService.formatLimit(limit);
  }

  formatStorageSize(sizeInMb: number): string {
    return this.enrichmentService.formatStorageSize(sizeInMb);
  }

  isPremiumPlan(capsule: ICapsuleUsageResponse): boolean {
    return this.enrichmentService.isPremiumPlan(capsule.currentPlan);
  }

  // Computed properties for template
  get totalCapsules(): number {
    return this.usageData.length;
  }

  get totalUsedStorage(): number {
    return this.usageData.length > 0 ? this.usageData[0].totalUsedStorage : 0;
  }

  get totalPurchasedStorage(): number {
    return this.usageData.reduce((total, capsule) => {
      const storageLimit = capsule.currentUsage['storage_mb'];
      return total + (storageLimit?.maxValue || 0);
    }, 0);
  }

  get totalRemainingStorage(): number {
    return Math.max(0, this.totalPurchasedStorage - this.totalUsedStorage);
  }

  // Methods still needed by template
  needsAttention(capsule: ICapsuleUsageResponse): boolean {
    if (!capsule.isActive) return true;
    
    // Check if any metric is above 80%
    const limitKeys = this.getObjectKeys(capsule.currentUsage);
    return limitKeys.some(key => this.getUtilizationPercentage(capsule, key) >= 80);
  }

  getStatusBadgeClass(isActive: boolean): string {
    return isActive ? 'active-badge' : 'expired-badge';
  }
}