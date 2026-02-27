import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../../common/services/base.service';
import { Recipient } from '../entities/recipient.entity';

@Injectable()
export class RecipientsService extends BaseService<Recipient> {
    constructor(
        @InjectRepository(Recipient)
        private readonly recipientRepository: Repository<Recipient>,
    ) {
        super(recipientRepository);
    }

    protected async checkOwnership(id: number, userId: number): Promise<boolean> {
        const recipient = await this.recipientRepository.findOne({
            where: { id },
            relations: ['capsule'],
        });
        
        return !!recipient && recipient.capsule.userId === userId;
    }

    async findByUser(userId: number): Promise<Recipient[]> {
        return this.findAll({
            relations: ['capsule'],
            where: {
                capsule: {
                    userId
                }
            },
            order: {
                created: 'DESC'
            }
        });
    }

    async findByCapsule(capsuleId: number): Promise<Recipient[]> {
        return this.findAll({
            where: { capsuleId },
            relations: ['capsule']
        });
    }

    /**
     * Mark capsule as opened by recipient
     * Only sets openedAt if not already opened
     * @param capsuleId Capsule ID
     * @param userEmail Recipient email
     */
    async markAsOpened(capsuleId: number, userEmail: string): Promise<void> {
        const recipient = await this.recipientRepository.findOne({
            where: { capsuleId, email: userEmail }
        });

        if (!recipient) {
            throw new Error(`Recipient not found for capsule ${capsuleId} and email ${userEmail}`);
        }

        // Only update if not already opened
        if (!recipient.openedAt) {
            await this.recipientRepository.update(
                { id: recipient.id },
                { openedAt: new Date() }
            );
        }
    }

    /**
     * Check if recipient has already opened the capsule
     * Based on openedAt field
     */
    async hasRecipientOpenedCapsule(capsuleId: number, userEmail: string): Promise<boolean> {
        const recipient = await this.recipientRepository.findOne({
            where: { capsuleId, email: userEmail }
        });
        return recipient?.openedAt !== null && recipient?.openedAt !== undefined;
    }
}