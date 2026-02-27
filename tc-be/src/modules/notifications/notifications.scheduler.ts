import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReminderPlannerService } from './services/reminder-planner.service';
import { NotificationDispatchService } from './services/notification-dispatch.service';

/**
 * Define in .env to override default cron expressions
*/
 // REMINDER_PLANNER_CRON=0 */10 * * * *      # 10 minutes
 // NOTIFICATION_DISPATCH_CRON=0 */5 * * * *  # 5 minutes

const plannerCron = process.env.REMINDER_PLANNER_CRON 
      || CronExpression.EVERY_10_MINUTES;
const dispatcherCron = process.env.NOTIFICATION_DISPATCH_CRON 
      || CronExpression.EVERY_5_MINUTES;

@Injectable()
export class NotificationsScheduler {
  constructor(
    private readonly planner: ReminderPlannerService,
    private readonly dispatcher: NotificationDispatchService,
  ) {}

  @Cron(plannerCron)
  async planReminders() {
    await this.planner.planReminders();
  }

  @Cron(dispatcherCron)
  async dispatchNotifications() {
    // await this.dispatcher.dispatchPending();
  }
}