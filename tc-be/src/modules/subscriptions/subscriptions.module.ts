import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SQLiteModule } from '../../common/services/sqlite/sqlite.module';
import { CapsulesModule } from '../capsules/capsules.module';
import { PaymentsModule } from '../payments/payments.module';
import { SubscriptionPlansController } from './controllers/subscription-plans.controller';
import { SubscriptionsController } from './controllers/subscriptions.controller';
import { SubscriptionHistory } from './entities/subscription-history.entity';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { UserSubscription } from './entities/user-subscription.entity';
import { SubscriptionHistoryService } from './services/subscription-history.service';
import { SubscriptionPlansService } from './services/subscription-plans.service';
import { SubscriptionsService } from './services/subscriptions.service';
import { UserSubscriptionService } from './services/user-subscription.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SubscriptionPlan,
      SubscriptionHistory,
      UserSubscription
    ]),
    CapsulesModule,
    PaymentsModule,
    SQLiteModule
  ],
  controllers: [SubscriptionPlansController, SubscriptionsController],
  providers: [
    SubscriptionPlansService,
    SubscriptionsService,
    UserSubscriptionService,
    SubscriptionHistoryService
  ],
  exports: [
    SubscriptionPlansService,
    SubscriptionsService,
    UserSubscriptionService,
    SubscriptionHistoryService,
  ]
})
export class SubscriptionsModule {}