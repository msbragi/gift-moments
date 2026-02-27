import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../../common/services/base.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService extends BaseService<User> {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {
        super(userRepository);
    }

    protected async checkOwnership(id: number, userId: number): Promise<boolean> {
        // Users can only access their own profile
        return id === userId;
    }

    async create(createUserDto: CreateUserDto): Promise<User> {
        // Create the user first
        const user = await super.create(createUserDto);

        if (!user) {
            throw new Error('Failed to create user account');
        }

        return user;
    }

    async findByEmail(email: string): Promise<User | undefined> {
        return this.userRepository.findOne({
            where: { email },
            select: {
                id: true,
                email: true,
                password: true,  // Explicitly include excluded field
                fullName: true,
                isFromGoogle: true,
                avatar: true,
                verifyToken: true,
                isVerified: true,
                pwdResetToken: true,
                pwdResetExpires: true,
                role: true,      // Include admin role field
                disabled: true,  // Include admin disabled field
            }
        });
    }

    /**
     * Find a user by their ID with selected fields
     * @param id The user ID to search for
     * @returns User data without sensitive fields
     */
    async findById(id: number): Promise<User | undefined> {
        return super.findOne(id, {
            select: {
                id: true,
                email: true,
                fullName: true,
                isFromGoogle: true,
                avatar: true,
                isVerified: true,
                role: true,      // Include admin role field
                disabled: true,  // Include admin disabled field
            }
        });
    }

    async findUserWithDetails(userId: number): Promise<User | undefined> {
        const user = await super.findOne(userId, {
            relations: ['userSubscriptions']
        });
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }

    async hasFreePlan(userId: number): Promise<boolean> {
        const user = await this.userRepository.findOne({
            where: {
                id: userId,
                userSubscriptions: {
                    subscriptionPlan: {
                        name: 'free'
                    }
                }
            },
            relations: {
                userSubscriptions: {
                    subscriptionPlan: true
                }
            }
        });
        return !!user;
    }
}
