import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { CapsulesService } from '../../../Services/api/capsules.service';
import { LoadingService } from '../../../Core/services/loading.service';
import { LoggerService } from '../../../Services/common/logger.service';

interface DetailedQuickAction {
  icon: string;
  label: string;
  route: string;
  description?: string;
  queryParams?: any;
  count?: number;
  lastActivity?: string;
  color: 'primary' | 'accent' | 'warn';
}

@Component({
  selector: 'tc-quick-access',
  standalone: true,
  imports: [
    CommonModule,
    TranslocoModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './quick-access.component.html',
  styleUrl: './quick-access.component.scss'
})
export class QuickAccessComponent implements OnInit, OnDestroy {
  quickActions: DetailedQuickAction[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private capsulesService: CapsulesService,
    public loadingService: LoadingService,
    private logger: LoggerService
  ) { }

  ngOnInit() {
    this.loadQuickActions();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadQuickActions() {
    // Loading is handled automatically by LoadingService via interceptors
    // Use forkJoin to get all capsule counts in parallel
    forkJoin({
      ownedCapsules: this.capsulesService.getCapsules(),
      publicCapsules: this.capsulesService.getPublicCapsules(),
      assignedCapsules: this.capsulesService.getAssignedCapsules()
    }).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.quickActions = this.buildQuickActionsWithCounts(
            data.ownedCapsules.length,
            data.publicCapsules.length,
            data.assignedCapsules.length
          );
        },
        error: (error) => {
          this.logger.log(`Error loading capsule data: ${error}`);
        }
      });
  }

  private buildQuickActionsWithCounts(
    ownedCount: number,
    publicCount: number,
    assignedCount: number
  ): DetailedQuickAction[] {
    return [
      {
        icon: 'inventory_2',
        label: 'dashboard.quickAccess.manageCapsules',
        description: 'Create and manage your capsules',
        route: '/capsules',
        color: 'primary',
        count: ownedCount
      },
      {
        icon: 'folder_shared',
        label: 'dashboard.quickAccess.assignedCapsules',
        description: 'Capsules where you are a recipient',
        route: '/capsule-explorer',
        queryParams: { type: 'assigned' },
        color: 'primary',
        count: assignedCount
      },
      {
        icon: 'public',
        label: 'dashboard.quickAccess.publicCapsules',
        description: 'Explore community capsules',
        route: '/capsule-explorer',
        queryParams: { type: 'public' },
        color: 'accent',
        count: publicCount
      },
      {
        icon: 'cloud_upload',
        label: 'dashboard.quickAccess.uploadLibrary',
        description: 'Your personal media library',
        route: '/library',
        color: 'accent'
      },
      {
        icon: 'account_circle',
        label: 'dashboard.quickAccess.profile',
        description: 'Account settings and preferences',
        route: '/profile',
        color: 'accent'
      }
    ];
  }

  navigateTo(route: string, queryParams?: any): void {
    if (queryParams) {
      this.router.navigate([route], { queryParams });
    } else {
      this.router.navigateByUrl(route);
    }
  }
}
