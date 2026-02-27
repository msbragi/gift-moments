import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { TranslocoModule } from '@jsverse/transloco';
import { Subject, takeUntil } from 'rxjs';
import { AdminService } from '../../../Services/api/admin.service';
import { LoadingService } from '../../../Core/services/loading.service';
import { SnackbarService } from '../../../Services/common/snackbar.service';

@Component({
  selector: 'tc-admin-stats',
  standalone: true,
  imports: [
    CommonModule,
    TranslocoModule,
    MatCardModule,
    MatIconModule,
    MatToolbarModule
  ],
  template: `
    <div class="admin-stats-container" *transloco="let t">
      <mat-toolbar class="admin-stats-toolbar">
        <mat-icon>analytics</mat-icon>
        <span class="toolbar-title">{{ t('admin.stats.title') }}</span>
      </mat-toolbar>

      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-header>
            <mat-card-title>{{ t('admin.stats.coming_soon') }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>{{ t('admin.stats.description') }}</p>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .admin-stats-container {
      padding: 16px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .admin-stats-toolbar {
      background: transparent;
      color: inherit;
      margin-bottom: 16px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

      .toolbar-title {
        margin-left: 12px;
        font-size: 1.25rem;
        font-weight: 500;
      }
    }

    .stats-grid {
      display: grid;
      gap: 16px;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    }

    .stat-card {
      min-height: 150px;
    }
  `]
})
export class AdminStatsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  statistics: any = null;

  constructor(
    private adminService: AdminService,
    public loadingService: LoadingService,
    private snackbar: SnackbarService
  ) {}

  ngOnInit(): void {
    this.loadStatistics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load admin statistics from the API
   */
  private loadStatistics(): void {
    this.adminService.getAdminStatistics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.statistics = stats;
        },
        error: () => {
          // Error handling via interceptors
        }
      });
  }
}
