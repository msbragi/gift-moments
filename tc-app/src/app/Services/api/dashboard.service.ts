import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface DashboardStats {
  totalCapsules: number;
  openCapsules: number;
  pendingCapsules: number;
  totalRecipients: number;
}

export interface ActivityItem {
  id: string;
  type: 'created' | 'opened' | 'invited' | 'reminder';
  title: string;
  description: string;
  timestamp: Date;
  capsuleId?: number;
  userId?: number;
}

export interface Notification {
  id: string;
  category: 'application' | 'user-centric' | 'discovery';
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  createdAt: Date;
  // User state tracking
  read?: Date;
  archived?: Date;
  deleted?: Date;
  // Computed properties
  isArchived: boolean;
  isDeleted: boolean;
}

export interface GlobalActivity {
  type: 'user-registered' | 'capsule-created-public' | 'capsule-created-private' | 'stats-weekly' | 'stats-monthly';
  icon: string;
  title: string;
  description: string;
  timestamp: Date;
  count?: number;
  period?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(
    private apiService: ApiService,
  ) {}

  /**
   * Get dashboard statistics
   */
  getDashboardStats(): Observable<DashboardStats> {
    return this.apiService.get<{data: DashboardStats}>('dashboard/summary').pipe(
      map(response => response.data)
    );
  }

  /**
   * Get recent activity items (using global activities as there's no specific activity endpoint)
   */
  getRecentActivity(limit: number = 10): Observable<ActivityItem[]> {
    console.log('DashboardService: Fetching activities...');
    return this.apiService.get<{data: any[]}>(`dashboard/global-activities?limit=${limit}`).pipe(
      map(response => {
        console.log('DashboardService: Raw response from backend:', response);
        const activities = response.data; // Extract data array from wrapper
        console.log('DashboardService: Extracted activities:', activities);
        const mapped = activities.map(activity => ({
          id: `${activity.type}-${activity.timestamp}`,
          type: this.mapGlobalActivityToActivityType(activity.type),
          title: activity.title,
          description: activity.description,
          timestamp: new Date(activity.timestamp), // timestamp should already be correct
          capsuleId: undefined,
          userId: undefined
        }));
        console.log('DashboardService: Mapped activities:', mapped);
        return mapped;
      })
    );
  }

  /**
   * Get user notifications
   */
  getNotifications(limit: number = 20): Observable<Notification[]> {
    console.log('DashboardService: Fetching notifications...');
    return this.apiService.get<{data: any[]}>(`dashboard/notifications?limit=${limit}`).pipe(
      map(response => {
        console.log('DashboardService: Raw response from backend:', response);
        const notifications = response.data; // Extract data array from wrapper
        console.log('DashboardService: Extracted notifications:', notifications);
        const mapped = notifications.map(notification => ({
          id: notification.id.toString(),
          category: notification.category,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          isRead: notification.isRead,
          priority: notification.priority,
          actionUrl: notification.actionUrl,
          createdAt: new Date(notification.created), // Map 'created' to 'createdAt'
          read: notification.read ? new Date(notification.read) : undefined,
          archived: notification.archived ? new Date(notification.archived) : undefined,
          deleted: notification.deleted ? new Date(notification.deleted) : undefined,
          isArchived: !!notification.archived,
          isDeleted: !!notification.deleted
        }));
        console.log('DashboardService: Mapped notifications:', mapped);
        return mapped;
      })
    );
  }

  /**
   * Mark a notification as read
   */
  markNotificationAsRead(notificationId: string): Observable<void> {
    return this.apiService.patch<void>(`dashboard/notifications/${notificationId}/state`, { action: 'read' });
  }

  /**
   * Mark all notifications as read
   */
  markAllNotificationsAsRead(): Observable<void> {
    return this.apiService.patch<void>('dashboard/notifications/state', { action: 'read' });
  }

  /**
   * Mark a notification as unread
   */
  markNotificationAsUnread(notificationId: string): Observable<void> {
    return this.apiService.patch<void>(`dashboard/notifications/${notificationId}/state`, { action: 'unread' });
  }

  /**
   * Delete a notification permanently
   */
  deleteNotification(notificationId: string): Observable<void> {
    return this.apiService.patch<void>(`dashboard/notifications/${notificationId}/state`, { action: 'delete' });
  }

  /**
   * Mark all notifications as unread
   */
  markAllNotificationsAsUnread(): Observable<void> {
    return this.apiService.patch<void>('dashboard/notifications/state', { action: 'unread' });
  }

  /**
   * Delete all notifications permanently
   */
  deleteAllNotifications(): Observable<void> {
    return this.apiService.patch<void>('dashboard/notifications/state', { action: 'delete' });
  }

  /**
   * Archive a notification
   */
  archiveNotification(notificationId: string): Observable<void> {
    return this.apiService.patch<void>(`dashboard/notifications/${notificationId}/state`, { action: 'archive' });
  }

  /**
   * Unarchive a notification
   */
  unarchiveNotification(notificationId: string): Observable<void> {
    return this.apiService.patch<void>(`dashboard/notifications/${notificationId}/state`, { action: 'unarchive' });
  }

  /**
   * Archive all notifications
   */
  archiveAllNotifications(): Observable<void> {
    return this.apiService.patch<void>('dashboard/notifications/state', { action: 'archive' });
  }

  /**
   * Unarchive all notifications
   */
  unarchiveAllNotifications(): Observable<void> {
    return this.apiService.patch<void>('dashboard/notifications/state', { action: 'unarchive' });
  }
  
  /**
   * Get global activities
   */
  getGlobalActivities(limit: number = 10): Observable<GlobalActivity[]> {
    return this.apiService.get<{data: GlobalActivity[]}>(`dashboard/global-activities?limit=${limit}`).pipe(
      map(response => response.data.map(activity => ({
        ...activity,
        timestamp: new Date(activity.timestamp)
      })))
    );
  }

  /**
   * Map GlobalActivity type to ActivityItem type
   */
  private mapGlobalActivityToActivityType(globalType: string): 'created' | 'opened' | 'invited' | 'reminder' {
    switch (globalType) {
      case 'user-registered':
        return 'invited';
      case 'capsule-created-public':
      case 'capsule-created-private':
        return 'created';
      case 'stats-weekly':
      case 'stats-monthly':
        return 'reminder';
      default:
        return 'created';
    }
  }
}