import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslocoModule } from '@jsverse/transloco';
import { Subject, takeUntil } from 'rxjs';
import { LoadingService } from '../../Core/services/loading.service';
import { IUser } from '../../Models/models.interface';
import { AuthService } from '../../Services/api/auth.service';
import { ChartStatisticsService } from '../../Services/api/chart-statistics.service';
import { ActivitySummaryComponent } from './activity-summary/activity-summary.component';
import { NotificationAreaComponent } from './notification-area/notification-area.component';
import { QuickAccessComponent } from './quick-access/quick-access.component';
import { TimelineChartDirectComponent } from './timeline-chart/timeline-chart-direct.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    TranslocoModule,
    MatButtonModule,
    MatCardModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatTabsModule,
    ActivitySummaryComponent,
    NotificationAreaComponent,
    QuickAccessComponent,
    TimelineChartDirectComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentUser: IUser | null = null;
  isCompactMode = false;
  gridCols = 2;
  
  private destroy$ = new Subject<void>();
  chartTimeline: boolean = true;
  chartData: any = null;

  constructor(
    private authService: AuthService,
    private loadingService: LoadingService,
    private breakpointObserver: BreakpointObserver,
    private chartStatisticsService: ChartStatisticsService
  ) {}

  ngOnInit() {
    // Ensure loading state is clean at start
    this.loadingService.resetLoading();
    
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user; 
      });
      
    // Set responsive grid columns
    this.breakpointObserver.observe(['(max-width: 768px)'])
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.gridCols = result.matches ? 1 : 2;
      });
      
    this.loadChartData();

    // Safety mechanism: Reset loading after 10 seconds if it gets stuck
    setTimeout(() => {
      if (this.loadingService.isLoading()) {
        console.warn('Loading state detected as stuck, forcing reset');
        this.loadingService.resetLoading();
      }
    }, 10000);
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  toggleCompactMode() {
    this.isCompactMode = !this.isCompactMode;
  }
  
  refreshDashboard() {
  }
  
  private loadChartData() {
    this.chartStatisticsService.generateCumulativeChartData().subscribe({
      next: (chartData) => {
        this.chartData = chartData;
      },
      error: (error) => {
        console.error('Error loading chart data from backend:', error);
        this.chartData = {
          labels: [],
          datasets: []
        };
      }
    });
  }
}