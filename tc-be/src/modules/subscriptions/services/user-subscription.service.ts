import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { BaseService } from '../../../common/services/base.service';
import { UserSubscription } from '../entities/user-subscription.entity';

@Injectable()
export class UserSubscriptionService extends BaseService<UserSubscription> {
  constructor(
    @InjectRepository(UserSubscription)
    private readonly userSubscriptionRepository: Repository<UserSubscription>,
  ) {
    super(userSubscriptionRepository);
  }

  protected async checkOwnership(id: number, userId: number): Promise<boolean> {
    const entity = await this.findOne(id);
    return entity?.userId === userId;
  }

  async hasFreeSubscription(userId: number, planName: string = 'free'): Promise<boolean> {
    const subscription = await this.userSubscriptionRepository.findOne({
      where: {
        userId,
        paymentMethod: ILike('free'),
        subscriptionPlan: { name: ILike(planName) }
      },
      relations: ['subscriptionPlan'],
    });
    return subscription ? true : false;
  }

    /**
     * Find user subscription by payment transaction ID
     * Used to check if subscription already exists for a transaction
     */
    async findByTransactionId(transactionId: number): Promise<UserSubscription | null> {
        return this.repository.findOne({
            where: { transactionId },
            relations: ['subscriptionPlan', 'capsule']
        });
    }
    
}