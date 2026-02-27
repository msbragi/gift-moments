import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { TranslocoModule } from '@jsverse/transloco';
import { Observable } from 'rxjs';
import { ActivityItem, DashboardService } from '../../../Services/api/dashboard.service';

@Component({
  selector: 'tc-activity-summary',
  standalone: true,
  imports: [
    CommonModule,
    TranslocoModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatListModule
  ],
  templateUrl: './activity-summary.component.html',
  styleUrl: './activity-summary.component.scss'
})
export class ActivitySummaryComponent implements OnInit {
  
  activities$: Observable<ActivityItem[]>;

  constructor(private dashboardService: DashboardService) {
    console.log('ActivitySummaryComponent: Initializing activity component...');
    
    // Only create the observable, don't subscribe here to avoid double calls
    this.activities$ = this.dashboardService.getRecentActivity(10);
  }

  ngOnInit(): void {}

  getActivityIcon(type: string): string {
    switch (type) {
      case 'created': return 'add_circle';
      case 'opened': return 'lock_open';
      case 'invited': return 'person_add';
      case 'reminder': return 'notifications';
      default: return 'info';
    }
  }

  getActivityColor(type: string): string {
    switch (type) {
      case 'created': return 'primary';
      case 'opened': return 'accent';
      case 'invited': return 'warn';
      case 'reminder': return 'primary';
      default: return 'primary';
    }
  }

  trackByActivityId(index: number, activity: ActivityItem): string {
    return activity.id;
  }

  formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);

    if (diffDays > 0) {
      return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
    } else if (diffHr > 0) {
      return diffHr === 1 ? '1 hour ago' : `${diffHr} hours ago`;
    } else if (diffMin > 0) {
      return diffMin === 1 ? '1 minute ago' : `${diffMin} minutes ago`;
    } else {
      return 'Just now';
    }
  }
}
