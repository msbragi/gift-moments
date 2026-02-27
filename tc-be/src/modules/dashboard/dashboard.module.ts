import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Capsule } from '../capsules/entities/capsule.entity';
import { Recipient } from '../recipients/entities/recipient.entity';
import { User } from '../users/entities/user.entity';
import { Item } from '../items/entities/item.entity';
import { LibraryItem } from '../library/entities/library-item.entity';
import { DashboardController } from './controllers/dashboard.controller';
import { UserNotification } from './entities/user-notification.entity';
import { UserNotificationView } from './entities/user-notification-view.entity';
import { DashboardService } from './services/dashboard.service';
import { GlobalActivityService } from './services/global-activity.service';
import { UserNotificationService } from './services/user-notification.service';
import { UserNotificationViewService } from './services/user-notification-view.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserNotification,
      UserNotificationView,
      User,
      Capsule,
      Recipient,
      Item,
      LibraryItem
    ])
  ],
  controllers: [DashboardController],
  providers: [
    DashboardService,
    GlobalActivityService,
    UserNotificationService,
    UserNotificationViewService
  ],
  exports: [
    DashboardService,
    GlobalActivityService,
    UserNotificationService,
    UserNotificationViewService
  ]
})
export class DashboardModule {}
