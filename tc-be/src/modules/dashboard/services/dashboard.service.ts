import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SqlHelper } from '../../../common/utils/sql.helper';
import { Capsule } from '../../capsules/entities/capsule.entity';
import { Item } from '../../items/entities/item.entity';
import { LibraryItem } from '../../library/entities/library-item.entity';
import { Recipient } from '../../recipients/entities/recipient.entity';
import { User } from '../../users/entities/user.entity';

export interface ChartStatistics {
    users: TimeSeriesData[];
    capsules: TimeSeriesData[];
    items: TimeSeriesData[];
    recipients: TimeSeriesData[];
    libraryItems: TimeSeriesData[];
    summary: {
        totalUsers: number;
        totalCapsules: number;
        totalItems: number;
        totalRecipients: number;
        totalLibraryItems: number;
    };
}

export interface TimeSeriesData {
    period: string; // YYYY-MM-DD format
    count: number;
    label: string; // Human readable format
}

@Injectable()
export class DashboardService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Capsule)
        private readonly capsuleRepository: Repository<Capsule>,
        @InjectRepository(Item)
        private readonly itemRepository: Repository<Item>,
        @InjectRepository(Recipient)
        private readonly recipientRepository: Repository<Recipient>,
        @InjectRepository(LibraryItem)
        private readonly libraryItemRepository: Repository<LibraryItem>
    ) {}

    /**
     * Get comprehensive global chart statistics with real historical data
     * Returns application-wide growth statistics for all entities
     * Starts from the first user registration date
     */
    async getChartStatistics(): Promise<ChartStatistics> {
        // Find the earliest user creation date to start the chart from there
        const earliestUser = await this.userRepository.createQueryBuilder('user')
            .select('user.created')
            .orderBy('user.created', 'ASC')
            .getOne();

        let startDate: Date;
        if (earliestUser?.created) {
            // Start from one week before the first user registration for better visual context
            startDate = new Date(earliestUser.created);
            startDate.setDate(startDate.getDate() - 7); // Subtract 7 days
            startDate.setDate(1); // Start of month
            startDate.setHours(0, 0, 0, 0);
        } else {
            // Fallback: if no users exist, use current month
            startDate = new Date();
            startDate.setDate(1);
            startDate.setHours(0, 0, 0, 0);
        }

        console.log(`Chart statistics starting from: ${startDate.toISOString()} (one week before first user)`);

        // Parallel execution of all aggregation queries - ALL GLOBAL
        const [
            userStats,
            capsuleStats, 
            itemStats,
            recipientStats,
            libraryStats,
            totals
        ] = await Promise.all([
            this.getMonthlyAggregation(this.userRepository, startDate),
            this.getMonthlyAggregation(this.capsuleRepository, startDate),
            this.getMonthlyAggregation(this.itemRepository, startDate),
            this.getMonthlyAggregation(this.recipientRepository, startDate),
            this.getMonthlyAggregation(this.libraryItemRepository, startDate),
            this.getGlobalTotalCounts()
        ]);

        return {
            users: userStats,
            capsules: capsuleStats,
            items: itemStats,
            recipients: recipientStats,
            libraryItems: libraryStats,
            summary: totals
        };
    }

    /**
     * Generic method to get global monthly aggregation for any entity using SqlHelper
     */
    private async getMonthlyAggregation(
        repository: Repository<any>,
        startDate: Date
    ): Promise<TimeSeriesData[]> {
        // Build cross-database compatible query using SqlHelper
        const yearCol = SqlHelper.datepart('YEAR', 'entity.created');
        const monthCol = SqlHelper.datepart('MONTH', 'entity.created');
        const paddedMonth = SqlHelper.lpad(SqlHelper.toString(monthCol), 2, '0');
        const periodExpression = SqlHelper.concat(SqlHelper.toString(yearCol), "'-'", paddedMonth);

        const queryBuilder = repository.createQueryBuilder('entity')
            .select([
                `${yearCol} as year`,
                `${monthCol} as month`,
                `${periodExpression} as period`,
                "COUNT(*) as count"
            ])
            .where('entity.created >= :startDate', { startDate })
            .andWhere('entity.deleted IS NULL')
            .groupBy(`${yearCol}, ${monthCol}`)
            .orderBy('year, month', 'ASC');

        const results = await queryBuilder.getRawMany();

        // Fill in missing months with zero counts
        const filledResults: TimeSeriesData[] = [];
        const currentDate = new Date(startDate);
        const endDate = new Date();

        while (currentDate <= endDate) {
            const periodKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
            const existingData = results.find(r => r.period === periodKey);
            
            filledResults.push({
                period: `${periodKey}-01`, // YYYY-MM-DD format for frontend
                count: existingData ? parseInt(existingData.count) : 0,
                label: currentDate.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short' 
                })
            });

            currentDate.setMonth(currentDate.getMonth() + 1);
        }

        return filledResults;
    }

    /**
     * Get global total counts for summary
     */
    private async getGlobalTotalCounts() {
        const [
            totalUsers,
            totalCapsules,
            totalItems,
            totalRecipients,
            totalLibraryItems
        ] = await Promise.all([
            this.userRepository.count({ where: { deleted: null } }),
            this.capsuleRepository.count({ where: { deleted: null } }),
            this.itemRepository.count({ where: { deleted: null } }),
            this.recipientRepository.count({ where: { deleted: null } }),
            this.libraryItemRepository.count({ where: { deleted: null } })
        ]);

        return {
            totalUsers,
            totalCapsules,
            totalItems,
            totalRecipients,
            totalLibraryItems
        };
    }
}