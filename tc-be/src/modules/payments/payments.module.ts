import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionPlan } from '../subscriptions/entities/subscription-plan.entity';
import { PaymentController } from './controllers/payment.controller';
import { PaymentGateway } from './entities/payment-gateway.entity';
import { PaymentTransaction } from './entities/payment-transaction.entity';
import { PaymentService } from './services/payment.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PaymentGateway,
      PaymentTransaction,
      SubscriptionPlan
    ])
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService]
})
export class PaymentsModule {}
