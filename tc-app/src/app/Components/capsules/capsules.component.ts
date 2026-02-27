import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule } from '@jsverse/transloco';
import { forkJoin, Subscription } from 'rxjs';
import { ICapsule } from '../../Models/models.interface';
import { CapsulesService } from '../../Services/api/capsules.service';
import { SubscriptionsService } from '../../Services/api/subscriptions.service';
import { CapsulesUIRefreshService, UI_REFRESH_SIGNAL } from './capsules-ui-refresh.service';
import { CapsuleManagerComponent } from './main/capsule-manager.component';
import { CapsuleItemsComponent } from './panels/capsule-items/capsule-items.component';
import { CapsuleLibraryComponent } from './panels/capsule-library/capsule-library.component';
import { CapsuleRecipientsComponent } from './panels/capsule-recipients/capsule-recipients.component';

@Component({
  selector: 'tc-capsules',
  standalone: true,
  imports: [
    CommonModule,
    TranslocoModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatToolbarModule,
    CapsuleManagerComponent,
    CapsuleItemsComponent,
    CapsuleLibraryComponent,
    CapsuleRecipientsComponent,
    MatTooltipModule
  ],
  templateUrl: './capsules.component.html',
  styleUrls: ['./capsules.component.scss']
})
export class CapsulesComponent implements OnInit, OnDestroy {
  // Track which panel is initially expanded
  expandedPanel: 'items' | 'library' | 'recipients' = 'library';


  selectedCapsule: ICapsule | null = null;
  allCapsules: ICapsule[] | null = null;
  private subscriptions = new Subscription();

  totalUsage: number = 0;

  constructor(
    private capsulesUIRefreshService: CapsulesUIRefreshService,
    private capsuleService: CapsulesService,
    private subscriptionService: SubscriptionsService
  ) {
    this.refreshItems();
    effect(() => {
      const refresh: UI_REFRESH_SIGNAL = this.capsulesUIRefreshService.refreshSignal();
      if (refresh.type) { // Avoid null type
        this.refreshItems();
        this.expandedPanel = refresh.type;
      }
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  refreshItems() {
    const capsuleId = this.selectedCapsule?.id || -1;
    const sub = forkJoin({
      usage: this.subscriptionService.getCapsuleUsageStatus(),
      capsules: this.capsuleService.getCapsules()
    }).subscribe(({ usage, capsules }) => {
      const capsulesWithUsage = capsules.map(capsule => {
        const usageInfo = usage?.find(u => u.subscription.capsule.id === capsule.id);
        return {
          ...capsule,
          usage: usageInfo?.currentUsage,
          plan: usageInfo?.subscription.subscriptionPlan,
          totalUsage: usageInfo?.totalUsedStorage || 0
        };
      });
      this.allCapsules = capsulesWithUsage;
      if (capsuleId > 0) {
        this.selectedCapsule = this.allCapsules.find(c => c.id === capsuleId) || null;
      }
    });
    this.subscriptions.add(sub);
  }

  onSelectCapsule(capsule: ICapsule) {
    this.expandedPanel = 'items';
    this.selectedCapsule = capsule;
  }

}