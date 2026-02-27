import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecipientNotification } from 'src/modules/recipients/entities/recipient-notifications.entity';
import { ReminderPlannerService } from './services/reminder-planner.service';
import { NotificationDispatchService } from './services/notification-dispatch.service';
import { NotificationsScheduler } from './notifications.scheduler';
import { EmailService } from 'src/modules/email/email.service';
import { CapsulesModule } from '../capsules/capsules.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RecipientNotification]),
    CapsulesModule,
  ],
  providers: [
    ReminderPlannerService,
    NotificationDispatchService,
    NotificationsScheduler,
    EmailService,
  ],
})
export class NotificationsModule {}