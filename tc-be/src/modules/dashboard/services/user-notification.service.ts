import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull, Not } from 'typeorm';
import { UserNotification } from '../entities/user-notification.entity';
import { UserNotificationView } from '../entities/user-notification-view.entity';
import { UserNotificationViewService } from './user-notification-view.service';
import { NotificationQueryDto } from '../dto/dashboard.dto';
import { NotificationResponseDto, CreateNotificationDto } from '../dto/notification.dto';

@Injectable()
export class UserNotificationService {
    constructor(
        @InjectRepository(UserNotification)
        private readonly notificationRepository: Repository<UserNotification>,
        @InjectRepository(UserNotificationView)
        private readonly viewRepository: Repository<UserNotificationView>,
        private readonly viewService: UserNotificationViewService
    ) { }

    /**
     * Get all visible notifications for a user
     * Implements the two-table architecture business logic:
     * - Global notifications: visible unless user explicitly deleted them
     * - User-specific notifications: only visible if user has view record and not deleted
     */
    async getUserNotifications(userId: number, query: NotificationQueryDto = {}): Promise<NotificationResponseDto[]> {
        const queryBuilder = this.notificationRepository
            .createQueryBuilder('notification')
            .leftJoin(
                'user_notifications_view',
                'view',
                'notification.id = view.notification_id AND view.user_id = :userId',
                { userId }
            )
            .select([
                'notification.id',
                'notification.title',
                'notification.message',
                'notification.type',
                'notification.category',
                'notification.isGlobal',
                'notification.priority',
                'notification.actionUrl',
                'notification.metadata',
                'notification.expires',
                'notification.created',
                'notification.updated',
                'view.read',
                'view.archived',
                'view.deleted'
            ]);

        // Core business logic: what notifications are visible to the user
        queryBuilder.where(
            // Global notifications: visible unless user deleted them
            '(notification.isGlobal = true AND (view.deleted IS NULL OR view.id IS NULL)) OR ' +
            // User-specific notifications: only if user has view record and not deleted
            '(notification.isGlobal = false AND view.notificationId IS NOT NULL AND view.deleted IS NULL)'
        );
        // Apply filters
        if (query.unreadOnly) {
            queryBuilder.andWhere('(view.read IS NULL OR view.id IS NULL)');
        }

        if (query.category) {
            queryBuilder.andWhere('notification.category = :category', { category: query.category });
        }

        if (query.archivedOnly) {
            queryBuilder.andWhere('view.archived IS NOT NULL');
        } else if (!query.includeArchived) {
            // By default, exclude archived notifications
            queryBuilder.andWhere('(view.archived IS NULL OR view.id IS NULL)');
        }

        // Exclude expired notifications
        queryBuilder.andWhere('(notification.expires IS NULL OR notification.expires > NOW())');

        // Apply ordering and pagination
        queryBuilder
            .orderBy('notification.created', 'DESC')
            .limit(query.limit || 20)
            .offset(query.offset || 0);

        const results = await queryBuilder.getRawMany();

        // Transform to DTOs
        return results.map(row => ({
            id: row.notification_id,
            title: row.notification_title,
            message: row.notification_message,
            type: row.notification_type,
            category: row.notification_category,
            isGlobal: Boolean(row.notification_isGlobal),
            priority: row.notification_priority,
            actionUrl: row.notification_actionUrl,
            metadata: this.parseMetadata(row.notification_metadata),
            expires: row.notification_expires,
            created: row.notification_created,
            updated: row.notification_updated,
            read: row.view_read,
            archived: row.view_archived,
            deleted: row.view_deleted,
            isRead: Boolean(row.view_read)
        }));
    }

    /**
     * Get count of unread notifications for a user
     */
    async getUnreadCount(userId: number): Promise<number> {
        const unreadNotifications = await this.getUserNotifications(userId, { unreadOnly: true });
        return unreadNotifications.length;
    }

    /**
     * Create a global notification (visible to all users)
     */
    async createGlobalNotification(notificationData: CreateNotificationDto): Promise<UserNotification> {
        const notification = this.notificationRepository.create({
            ...notificationData,
            isGlobal: true,
            metadata: typeof notificationData.metadata === 'object'
                ? JSON.stringify(notificationData.metadata)
                : notificationData.metadata
        });

        return await this.notificationRepository.save(notification);
    }

    /**
     * Create user-specific notifications for a list of users
     */
    async createUserSpecificNotifications(
        notificationData: CreateNotificationDto,
        targetUserIds: number[]
    ): Promise<UserNotification> {
        // Create the notification
        const notification = this.notificationRepository.create({
            ...notificationData,
            isGlobal: false,
            metadata: typeof notificationData.metadata === 'object'
                ? JSON.stringify(notificationData.metadata)
                : notificationData.metadata
        });

        const savedNotification = await this.notificationRepository.save(notification);

        // Create view records for each target user
        for (const userId of targetUserIds) {
            await this.viewService.getOrCreateView(savedNotification.id, userId);
        }

        return savedNotification;
    }

    /**
     * Mark notification as read for a user
     */
    async markAsRead(notificationId: number, userId: number): Promise<void> {
        await this.viewService.markAsRead(notificationId, userId);
    }

    /**
     * Mark notification as unread for a user
     */
    async markAsUnread(notificationId: number, userId: number): Promise<void> {
        await this.viewService.markAsUnread(notificationId, userId);
    }

    /**
     * Mark all visible notifications as read for a user
     */
    async markAllAsRead(userId: number): Promise<void> {
        const visibleNotifications = await this.getUserNotifications(userId, { includeArchived: true });
        const unreadIds = visibleNotifications
            .filter(n => !n.isRead)
            .map(n => n.id);

        if (unreadIds.length > 0) {
            await this.viewService.markAllAsReadForUser(userId, unreadIds);
        }
    }

    /**
     * Mark all notifications as unread for a user
     */
    async markAllAsUnread(userId: number): Promise<void> {
        const visibleNotifications = await this.getUserNotifications(userId, { includeArchived: true });
        const readIds = visibleNotifications
            .filter(n => n.isRead)
            .map(n => n.id);

        if (readIds.length > 0) {
            await this.viewService.markAllAsUnreadForUser(userId, readIds);
        }
    }

    /**
     * Archive notification for a user (hide)
     */
    async archiveNotification(notificationId: number, userId: number): Promise<void> {
        await this.viewService.archiveNotification(notificationId, userId);
    }

    /**
     * Unarchive notification for a user (show)
     */
    async unarchiveNotification(notificationId: number, userId: number): Promise<void> {
        await this.viewService.unarchiveNotification(notificationId, userId);
    }

    /**
     * Archive all read notifications for a user
     */
    async archiveAllRead(userId: number): Promise<void> {
        await this.viewService.archiveAllReadForUser(userId);
    }

    /**
     * Unarchive all notifications for a user
     */
    async unarchiveAll(userId: number): Promise<void> {
        await this.viewService.unarchiveAllForUser(userId);
    }

    /**
     * Delete notification for a user (soft delete)
     */
    async deleteNotification(notificationId: number, userId: number): Promise<void> {
        await this.viewService.deleteNotification(notificationId, userId);
    }

    /**
     * Delete all read notifications for a user
     */
    async deleteAllReadNotifications(userId: number): Promise<void> {
        await this.viewService.deleteAllReadForUser(userId);
    }

    /**
     * Get user notification summary
     */
    async getUserNotificationSummary(userId: number): Promise<{
        total: number;
        unread: number;
        archived: number;
        deleted: number;
    }> {
        return await this.viewService.getUserNotificationSummary(userId);
    }

    /**
     * Helper method to parse metadata safely
     */
    private parseMetadata(metadata: string): any {
        if (!metadata) return undefined;

        try {
            return JSON.parse(metadata);
        } catch (e) {
            return metadata; // Return as string if parsing fails
        }
    }
}
