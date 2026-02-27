import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../users/entities/user.entity';
import { Capsule } from '../capsules/entities/capsule.entity';
import { PaymentGateway } from '../payments/entities/payment-gateway.entity';
import { PaymentTransaction } from '../payments/entities/payment-transaction.entity';
import { PaymentGatewayService } from '../payments/services/payment-gateway.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Capsule, PaymentGateway, PaymentTransaction])],
  controllers: [AdminController],
  providers: [AdminService, PaymentGatewayService],
  exports: [AdminService],
})
export class AdminModule {}
