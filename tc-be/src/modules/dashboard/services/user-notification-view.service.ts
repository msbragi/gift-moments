import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull, Not } from 'typeorm';
import { UserNotificationView } from '../entities/user-notification-view.entity';

@Injectable()
export class UserNotificationViewService {
    constructor(
        @InjectRepository(UserNotificationView)
        private readonly viewRepository: Repository<UserNotificationView>
    ) {}

    /**
     * Get or create a user notification view record
     */
    async getOrCreateView(notificationId: number, userId: number): Promise<UserNotificationView> {
        let view = await this.viewRepository.findOne({
            where: { notificationId, userId }
        });

        if (!view) {
            view = this.viewRepository.create({
                notificationId,
                userId
            });
            view = await this.viewRepository.save(view);
        }

        return view;
    }

    /**
     * Mark notification as read for a user
     */
    async markAsRead(notificationId: number, userId: number): Promise<void> {
        const view = await this.getOrCreateView(notificationId, userId);
        
        if (!view.read) {
            await this.viewRepository.update(view.id, {
                read: new Date()
            });
        }
    }

    /**
     * Mark notification as unread for a user
     */
    async markAsUnread(notificationId: number, userId: number): Promise<void> {
        const view = await this.getOrCreateView(notificationId, userId);
        
        await this.viewRepository.update(view.id, {
            read: null
        });
    }

    /**
     * Archive notification for a user (hide)
     */
    async archiveNotification(notificationId: number, userId: number): Promise<void> {
        const view = await this.getOrCreateView(notificationId, userId);
        
        await this.viewRepository.update(view.id, {
            archived: new Date(),
            read: view.read || new Date() // Auto-mark as read when archiving
        });
    }

    /**
     * Unarchive notification for a user (show)
     */
    async unarchiveNotification(notificationId: number, userId: number): Promise<void> {
        const view = await this.getOrCreateView(notificationId, userId);
        
        await this.viewRepository.update(view.id, {
            archived: null
        });
    }

    /**
     * Delete notification for a user (soft delete)
     */
    async deleteNotification(notificationId: number, userId: number): Promise<void> {
        const view = await this.getOrCreateView(notificationId, userId);
        
        await this.viewRepository.update(view.id, {
            deleted: new Date()
        });
    }

    /**
     * Restore deleted notification for a user
     */
    async restoreNotification(notificationId: number, userId: number): Promise<void> {
        const view = await this.getOrCreateView(notificationId, userId);
        
        await this.viewRepository.update(view.id, {
            deleted: null
        });
    }

    /**
     * Get user views for specific notifications
     */
    async getUserViews(notificationIds: number[], userId: number): Promise<UserNotificationView[]> {
        return this.viewRepository.find({
            where: {
                notificationId: In(notificationIds),
                userId
            }
        });
    }

    /**
     * Mark all specified notifications as read for a user
     */
    async markAllAsReadForUser(userId: number, notificationIds?: number[]): Promise<void> {
        const whereClause: any = { userId, read: IsNull() };
        
        if (notificationIds && notificationIds.length > 0) {
            whereClause.notificationId = In(notificationIds);
        }

        await this.viewRepository.update(whereClause, {
            read: new Date()
        });
    }

    /**
     * Mark all specified notifications as unread for a user
     */
    async markAllAsUnreadForUser(userId: number, notificationIds?: number[]): Promise<void> {
        const whereClause: any = { userId };
        
        if (notificationIds && notificationIds.length > 0) {
            whereClause.notificationId = In(notificationIds);
        }

        await this.viewRepository.update(whereClause, {
            read: null
        });
    }

    /**
     * Archive all read notifications for a user
     */
    async archiveAllReadForUser(userId: number): Promise<void> {
        await this.viewRepository.update(
            { 
                userId, 
                read: Not(IsNull()), 
                archived: IsNull() 
            },
            { archived: new Date() }
        );
    }

    /**
     * Delete all read notifications for a user
     */
    async deleteAllReadForUser(userId: number): Promise<void> {
        await this.viewRepository.update(
            { 
                userId, 
                read: Not(IsNull()), 
                deleted: IsNull() 
            },
            { deleted: new Date() }
        );
    }

    /**
     * Unarchive all notifications for a user
     */
    async unarchiveAllForUser(userId: number): Promise<void> {
        await this.viewRepository.update(
            { userId, archived: Not(IsNull()) },
            { archived: null }
        );
    }

    /**
     * Get user notification state summary
     */
    async getUserNotificationSummary(userId: number): Promise<{
        total: number;
        unread: number;
        archived: number;
        deleted: number;
    }> {
        const [total, unread, archived, deleted] = await Promise.all([
            this.viewRepository.count({ where: { userId } }),
            this.viewRepository.count({ where: { userId, read: IsNull(), deleted: IsNull() } }),
            this.viewRepository.count({ where: { userId, archived: Not(IsNull()), deleted: IsNull() } }),
            this.viewRepository.count({ where: { userId, deleted: Not(IsNull()) } })
        ]);

        return { total, unread, archived, deleted };
    }
}
