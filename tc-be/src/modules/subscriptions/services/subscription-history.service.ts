import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../../common/services/base.service';
import { SubscriptionHistory } from '../entities/subscription-history.entity';

@Injectable()
export class SubscriptionHistoryService extends BaseService<SubscriptionHistory> {
  constructor(
    @InjectRepository(SubscriptionHistory)
    private readonly subscriptionHistoryRepository: Repository<SubscriptionHistory>,
  ) {
    super(subscriptionHistoryRepository);
  }

  // Ownership check (customize as needed)
  protected async checkOwnership(id: number, userId: number): Promise<boolean> {
    const entity = await this.findOne(id);
    return entity?.userId === userId;
  }

  // Example: Find all history records for a user
  async findAllForUser(userId: number): Promise<SubscriptionHistory[]> {
    return super.findAll({
      where: { userId },
      order: { created: 'DESC' },
    });
  }
}