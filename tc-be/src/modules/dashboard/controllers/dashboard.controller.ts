import { Controller, Get, Patch, Param, Query, Body, Post, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { User } from '../../../common/decorators/user.decorator';
import { DashboardService } from '../services/dashboard.service';
import { GlobalActivityService } from '../services/global-activity.service';
import { UserNotificationService } from '../services/user-notification.service';
import { 
    GlobalActivityQueryDto, 
    NotificationQueryDto 
} from '../dto/dashboard.dto';
import { SetNotificationStateDto, SetAllNotificationsStateDto } from '../dto/notification-state.dto';

@ApiTags('dashboard')
@Controller('/api/v1/dashboard')
export class DashboardController {
    constructor(
        private readonly dashboardService: DashboardService,
        private readonly globalActivityService: GlobalActivityService,
        private readonly userNotificationService: UserNotificationService
    ) {}

    @Get('global-activities')
    @ApiOperation({ summary: 'Get global platform activities' })
    @ApiResponse({ status: 200, description: 'Global activities retrieved successfully' })
    async getGlobalActivities(@Query() query: GlobalActivityQueryDto) {
        return this.globalActivityService.getGlobalActivities(query);
    }

    @Get('notifications')
    @ApiOperation({ summary: 'Get user notifications' })
    @ApiResponse({ status: 200, description: 'Notifications retrieved successfully' })
    async getNotifications(
        @User('userId') userId: number,
        @Query() query: NotificationQueryDto
    ) {
        return this.userNotificationService.getUserNotifications(userId, query);
    }

    @Patch('notifications/:id/state')
    @ApiOperation({ summary: 'Set notification state (read/unread/archive/unarchive/delete)' })
    @ApiResponse({ status: 200, description: 'Notification state updated successfully' })
    async setNotificationState(
        @Param('id') notificationId: string,
        @User('userId') userId: number,
        @Body() stateDto: SetNotificationStateDto
    ) {
        const id = parseInt(notificationId);
        
        switch (stateDto.action) {
            case 'read':
                await this.userNotificationService.markAsRead(id, userId);
                break;
            case 'unread':
                await this.userNotificationService.markAsUnread(id, userId);
                break;
            case 'archive':
                await this.userNotificationService.archiveNotification(id, userId);
                break;
            case 'unarchive':
                await this.userNotificationService.unarchiveNotification(id, userId);
                break;
            case 'delete':
                await this.userNotificationService.deleteNotification(id, userId);
                break;
        }
        
        return { success: true, action: stateDto.action };
    }

    @Patch('notifications/state')
    @ApiOperation({ summary: 'Set state for all notifications (bulk operations)' })
    @ApiResponse({ status: 200, description: 'Bulk notification state updated successfully' })
    async setAllNotificationsState(
        @User('userId') userId: number,
        @Body() stateDto: SetAllNotificationsStateDto
    ) {
        switch (stateDto.action) {
            case 'read-all':
                await this.userNotificationService.markAllAsRead(userId);
                break;
            case 'unread-all':
                await this.userNotificationService.markAllAsUnread(userId);
                break;
            case 'archive-all-read':
                await this.userNotificationService.archiveAllRead(userId);
                break;
            case 'unarchive-all':
                await this.userNotificationService.unarchiveAll(userId);
                break;
            case 'delete-all-read':
                await this.userNotificationService.deleteAllReadNotifications(userId);
                break;
        }
        
        return { success: true, action: stateDto.action };
    }

    @Get('notifications/summary')
    @ApiOperation({ summary: 'Get user notification summary' })
    @ApiResponse({ status: 200, description: 'Notification summary retrieved successfully' })
    async getNotificationSummary(@User('userId') userId: number) {
        return this.userNotificationService.getUserNotificationSummary(userId);
    }

    @Get('chart-stats')
    @ApiOperation({ summary: 'Get global chart statistics with real historical data' })
    @ApiResponse({ status: 200, description: 'Global chart statistics retrieved successfully' })
    async getChartStatistics() {
        return this.dashboardService.getChartStatistics();
    }

}
