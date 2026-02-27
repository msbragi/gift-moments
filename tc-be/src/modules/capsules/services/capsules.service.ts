import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseService } from "src/common/services/base.service";
import { Repository } from "typeorm";
import { Capsule } from "../entities/capsule.entity";

@Injectable()
export class CapsulesService extends BaseService<Capsule> {

    constructor(
        @InjectRepository(Capsule)
        repository: Repository<Capsule>
    ) {
        super(repository);
    }

    protected async checkOwnership(id: number, userId: number): Promise<boolean> {
        const capsule = await this.repository.findOne({
            where: { id, userId }
        });
        return !!capsule;
    }

    async getAllPublic() {
        const capsules = await this.findAll({
            where: { isPublic: true },
            relations: ['items', 'recipients'],
            order: { created: 'DESC' }
        });

        // Apply security filters to public capsules too
        return capsules.map(capsule => this.applyCapsuleSecurityFilter(capsule));
    }

    async findAllByUser(userId: number): Promise<Capsule[]> {
        const capsules = await this.findAll({
            where: { userId },
            relations: ['items', 'recipients', 'recipients.notifications'],
            order: { created: 'DESC' }
        });
        return capsules;
    }

    async findOneWithDetails(id: number): Promise<Capsule> {
        return this.findOne(id, {
            relations: ['items', 'recipients', 'recipients.notifications']
        });
    }

    async findOneByUserWithDetails(id: number, userId: number): Promise<Capsule> {
        return this.findOneByUser(id, userId, {
            relations: ['items', 'recipients', 'recipients.notifications']
        });
    }

    async countByUser(userId: number): Promise<number> {
        return await this.repository.count({
            where: { userId }
        });
    }

    /**
     * Get capsules assigned to user as recipient
     * Applies security filters based on openDate
     */
    async getAssignedCapsules(userEmail: string): Promise<Capsule[]> {
        const query = this.repository.createQueryBuilder('capsule')
            .innerJoin('capsule.recipients', 'recipient_filter')
            .leftJoinAndSelect('capsule.items', 'items')
            .leftJoinAndSelect('capsule.recipients', 'recipients')
            .where('recipient_filter.email = :email', { email: userEmail })
            .orderBy('capsule.created', 'DESC');

        const capsules = await query.getMany();

        // Apply security filters based on openDate
        return capsules.map(capsule => this.applyCapsuleSecurityFilter(capsule));
    }

    /**
     * Get a specific capsule assigned to user as recipient
     * Applies security filters based on openDate
     * @throws NotFoundException if capsule is not found or not assigned to user
     */
    async getAssignedCapsule(id: number, userEmail: string): Promise<Capsule> {
        const query = this.repository.createQueryBuilder('capsule')
            .innerJoin('capsule.recipients', 'recipient_filter')
            .leftJoinAndSelect('capsule.items', 'items')
            .leftJoinAndSelect('capsule.recipients', 'recipients')
            .where('capsule.id = :id', { id })
            .andWhere('recipient_filter.email = :email', { email: userEmail });

        const capsule = await query.getOne();

        if (!capsule) {
            throw new Error(`Capsule with id ${id} not found or not assigned to user`);
        }

        // Apply security filter based on openDate
        return this.applyCapsuleSecurityFilter(capsule);
    }

    /**
     * Mark capsule as opened by recipient (if eligible and not already opened)
     * Should be called when recipient accesses an assigned capsule
     * @param capsuleId Capsule ID
     * @param userEmail Recipient email
     */
    async markAsOpenedIfEligible(capsuleId: number, userEmail: string): Promise<void> {
        const now = new Date();
        
        // Check if capsule is eligible to be opened (openDate has passed)
        const capsule = await this.repository.findOne({
            where: { id: capsuleId },
            select: ['id', 'openDate']
        });

        if (!capsule || capsule.openDate > now) {
            // Capsule not found or not eligible to be opened yet
            return;
        }

        // Mark as opened via recipients service
        // await this.recipientsService.markAsOpened(capsuleId, userEmail);
    }

    /**
     * Apply security filter to capsule based on openDate
     * - Hide items metadata if capsule is not yet open (but keep count)
     * - Hide location data for physical capsules if not yet open
     * - Always include itemsCount and recipientsCount (non-sensitive info)
     */
    private applyCapsuleSecurityFilter(capsule: Capsule): Capsule {
        const now = new Date();
        const isTimeToOpen = capsule.openDate <= now;

        // Create a copy to avoid modifying the original
        const filteredCapsule = { ...capsule };

        // Always include counts (non-sensitive information)
        filteredCapsule.itemsCount = capsule.items?.length || 0;
        filteredCapsule.recipientsCount = capsule.recipients?.length || 0;

        // If capsule is not yet open, hide sensitive data
        if (!isTimeToOpen) {
            // Remove items metadata if not yet open (but keep count)
            if (filteredCapsule.items) {
                delete filteredCapsule.items;
            }

            // Remove recipients data if not yet open (but keep count)
            if (filteredCapsule.recipients) {
                delete filteredCapsule.recipients;
            }

            // Remove location data for physical capsules if not yet open
            if (filteredCapsule.isPhysical) {
                delete filteredCapsule.lat;
                delete filteredCapsule.lng;
            }
        }

        return filteredCapsule;
    }
}