import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { TranslocoModule } from '@jsverse/transloco';
import { Observable, map } from 'rxjs';
import { DashboardService, Notification } from '../../../Services/api/dashboard.service';

@Component({
  selector: 'tc-notification-area',
  standalone: true,
  imports: [
    CommonModule,
    TranslocoModule,
    MatIconModule,
    MatBadgeModule,
    MatButtonModule,
    MatListModule,
    MatDividerModule
  ],
  templateUrl: './notification-area.component.html',
  styleUrl: './notification-area.component.scss'
})
export class NotificationAreaComponent implements OnInit {
  notifications$: Observable<Notification[]>;
  unreadCount$: Observable<number>;
  showArchived = false; // Toggle per visualizzare archiviate
  filteredNotifications$: Observable<Notification[]>;

  constructor(private dashboardService: DashboardService) {
    console.log('NotificationAreaComponent: Initializing notification component...');
    
    // Only create the observable, don't subscribe here to avoid double calls
    this.notifications$ = this.dashboardService.getNotifications();
    
    // Filtered notifications based on showArchived toggle
    this.filteredNotifications$ = this.notifications$.pipe(
      map(notifications => {
        if (!notifications) return [];
        return this.showArchived 
          ? notifications.filter(n => n.isArchived && !n.isDeleted)   // Show only archived, not deleted
          : notifications.filter(n => !n.isArchived && !n.isDeleted); // Show only unarchived, not deleted
      })
    );
    
    this.unreadCount$ = this.notifications$.pipe(
      map(notifications => {
        const count = notifications ? notifications.filter(n => !n.isRead && !n.isDeleted).length : 0;
        console.log('NotificationAreaComponent: Unread count:', count);
        return count;
      })
    );
  }

  ngOnInit(): void {}

  markAsRead(notification: Notification): void {
    if (!notification.isRead) {
      this.dashboardService.markNotificationAsRead(notification.id).subscribe({
        next: () => {
          this.refreshNotifications();
        }
      });
    }
  }

  markAllAsRead(): void {
    this.dashboardService.markAllNotificationsAsRead().subscribe({
      next: () => {
        this.refreshNotifications();
      }
    });
  }

  // New methods for archived notifications management
  markAsUnread(notification: Notification): void {
    if (notification.isRead) {
      this.dashboardService.markNotificationAsUnread(notification.id).subscribe({
        next: () => {
          this.refreshNotifications();
        }
      });
    }
  }

  deleteNotification(notification: Notification): void {
    this.dashboardService.deleteNotification(notification.id).subscribe({
      next: () => {
        this.refreshNotifications();
      }
    });
  }

  archiveNotification(notification: Notification): void {
    this.dashboardService.archiveNotification(notification.id).subscribe({
      next: () => {
        this.refreshNotifications();
      }
    });
  }

  unarchiveNotification(notification: Notification): void {
    this.dashboardService.unarchiveNotification(notification.id).subscribe({
      next: () => {
        this.refreshNotifications();
      }
    });
  }

  markAllAsUnread(): void {
    this.dashboardService.markAllNotificationsAsUnread().subscribe({
      next: () => {
        this.refreshNotifications();
      }
    });
  }

  deleteAllNotifications(): void {
    this.dashboardService.deleteAllNotifications().subscribe({
      next: () => {
        this.refreshNotifications();
      }
    });
  }

  archiveAllNotifications(): void {
    this.dashboardService.archiveAllNotifications().subscribe({
      next: () => {
        this.refreshNotifications();
      }
    });
  }

  unarchiveAllNotifications(): void {
    this.dashboardService.unarchiveAllNotifications().subscribe({
      next: () => {
        this.refreshNotifications();
      }
    });
  }

  toggleArchiveView(): void {
    this.showArchived = !this.showArchived;
    this.updateFilteredNotifications();
  }

  private refreshNotifications(): void {
    this.notifications$ = this.dashboardService.getNotifications();
    this.updateFilteredNotifications();
    this.unreadCount$ = this.notifications$.pipe(
      map(notifications => notifications.filter(n => !n.isRead && !n.isDeleted).length)
    );
  }

  private updateFilteredNotifications(): void {
    this.filteredNotifications$ = this.notifications$.pipe(
      map(notifications => {
        if (!notifications) return [];
        return this.showArchived 
          ? notifications.filter(n => n.isArchived && !n.isDeleted)   // Show only archived, not deleted
          : notifications.filter(n => !n.isArchived && !n.isDeleted); // Show only unarchived, not deleted
      })
    );
  }

  getIcon(type: string): string {
    switch(type) {
      case 'system-update': 
      case 'maintenance': 
        return 'info';
      case 'capsule-opening':
      case 'capsule-reminder':
        return 'event_reminder';
      case 'activity':
      case 'new-capsule':
        return 'notifications_active';
      default: 
        return 'notifications';
    }
  }

  getIconClass(notification: Notification): string {
    return notification.priority === 'high' ? 'high-priority' : '';
  }

  formatRelativeTime(date: Date): string {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffMs = now.getTime() - notificationDate.getTime();
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
