import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Capsule } from '../../capsules/entities/capsule.entity';
import { GlobalActivityQueryDto } from '../dto/dashboard.dto';

export interface GlobalActivity {
    type: 'user-registered' | 'capsule-created-public' | 'capsule-created-private' | 'stats-weekly' | 'stats-monthly';
    icon: string;
    title: string;
    description: string;
    timestamp: Date;
    count?: number;
    period?: string;
}

@Injectable()
export class GlobalActivityService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Capsule)
        private readonly capsuleRepository: Repository<Capsule>
    ) {}

    async getGlobalActivities(query: GlobalActivityQueryDto): Promise<GlobalActivity[]> {
        const activities: GlobalActivity[] = [];

        try {
            // Ultimo utente registrato
            const lastUser = await this.userRepository.findOne({
                where: {},
                order: { created: 'DESC' },
                select: ['id', 'fullName', 'email', 'created']
            });

            if (lastUser) {
                activities.push({
                    type: 'user-registered',
                    icon: 'person_add',
                    title: 'New User Joined',
                    description: `${lastUser.fullName || 'Someone'} joined the platform`,
                    timestamp: lastUser.created
                });
            }

            // Ultima capsula pubblica creata
            const lastPublicCapsule = await this.capsuleRepository.findOne({
                where: { isPublic: true },
                order: { created: 'DESC' },
                select: ['id', 'name', 'created'],
                relations: ['user']
            });

            if (lastPublicCapsule) {
                activities.push({
                    type: 'capsule-created-public',
                    icon: 'public',
                    title: 'New Public Capsule',
                    description: `"${lastPublicCapsule.name}" was created`,
                    timestamp: lastPublicCapsule.created
                });
            }

            // Ultima capsula privata (info generica)
            const lastPrivateCapsule = await this.capsuleRepository.findOne({
                where: { isPublic: false },
                order: { created: 'DESC' },
                select: ['id', 'created']
            });

            if (lastPrivateCapsule) {
                activities.push({
                    type: 'capsule-created-private',
                    icon: 'lock',
                    title: 'New Private Capsule',
                    description: 'Someone created a private capsule',
                    timestamp: lastPrivateCapsule.created
                });
            }

            // Statistiche settimanali
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);

            const weeklyUsers = await this.userRepository.count({
                where: { created: MoreThan(weekAgo) }
            });

            const weeklyCapsules = await this.capsuleRepository.count({
                where: { created: MoreThan(weekAgo) }
            });

            if (weeklyUsers > 0 || weeklyCapsules > 0) {
                activities.push({
                    type: 'stats-weekly',
                    icon: 'trending_up',
                    title: 'Weekly Activity',
                    description: `${weeklyUsers} new users, ${weeklyCapsules} new capsules`,
                    timestamp: new Date(),
                    count: weeklyUsers + weeklyCapsules,
                    period: 'this week'
                });
            }

            // Statistiche mensili
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);

            const monthlyUsers = await this.userRepository.count({
                where: { created: MoreThan(monthAgo) }
            });

            const monthlyCapsules = await this.capsuleRepository.count({
                where: { created: MoreThan(monthAgo) }
            });

            if (monthlyUsers > 0 || monthlyCapsules > 0) {
                activities.push({
                    type: 'stats-monthly',
                    icon: 'calendar_month',
                    title: 'Monthly Growth',
                    description: `${monthlyUsers} new users, ${monthlyCapsules} new capsules`,
                    timestamp: new Date(),
                    count: monthlyUsers + monthlyCapsules,
                    period: 'this month'
                });
            }

        } catch (error) {
            console.error('Error fetching global activities:', error);
            // Return empty array on error instead of throwing
        }

        // Ordina per timestamp e applica limit/offset
        const sortedActivities = activities
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(query.offset || 0, (query.offset || 0) + (query.limit || 10));

        return sortedActivities;
    }

    async getWeeklyStats() {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const [weeklyUsers, weeklyCapsules, weeklyPublicCapsules] = await Promise.all([
            this.userRepository.count({ where: { created: MoreThan(weekAgo) } }),
            this.capsuleRepository.count({ where: { created: MoreThan(weekAgo) } }),
            this.capsuleRepository.count({ 
                where: { 
                    created: MoreThan(weekAgo), 
                    isPublic: true 
                } 
            })
        ]);

        return {
            users: weeklyUsers,
            capsules: weeklyCapsules,
            publicCapsules: weeklyPublicCapsules,
            privateCapsules: weeklyCapsules - weeklyPublicCapsules
        };
    }

    async getMonthlyStats() {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);

        const [monthlyUsers, monthlyCapsules, monthlyPublicCapsules] = await Promise.all([
            this.userRepository.count({ where: { created: MoreThan(monthAgo) } }),
            this.capsuleRepository.count({ where: { created: MoreThan(monthAgo) } }),
            this.capsuleRepository.count({ 
                where: { 
                    created: MoreThan(monthAgo), 
                    isPublic: true 
                } 
            })
        ]);

        return {
            users: monthlyUsers,
            capsules: monthlyCapsules,
            publicCapsules: monthlyPublicCapsules,
            privateCapsules: monthlyCapsules - monthlyPublicCapsules
        };
    }
}
