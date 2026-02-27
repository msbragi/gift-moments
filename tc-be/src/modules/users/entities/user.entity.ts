import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { IUser } from '../../../common/interfaces/models.interface';
import { Capsule } from '../../capsules/entities/capsule.entity';
import { UserSubscription } from '../../subscriptions/entities/user-subscription.entity';

@Entity('users')
export class User extends BaseEntity implements IUser {
    @ApiProperty()
    @Column({ unique: true })
    email: string;

    @Column({ select: false })
    password?: string;

    @ApiProperty()
    @Column({name: 'full_name', nullable: true })
    fullName?: string;

    @ApiProperty()
    @Column({name: 'is_from_google', default: false })
    isFromGoogle?: boolean;

    @ApiProperty()
    @Column({ nullable: true })
    avatar?: string;

    @ApiProperty()
    @Column({ name: "is_verified", default: () => "'0'" })
    isVerified: boolean;
    
    @ApiProperty()
    @Column("varchar", { name: "verification_token", nullable: true, length: 255 })
    verifyToken: string | null;

    @ApiProperty()
    @Column("varchar", { name: "pwd_reset_token", nullable: true, length: 255 })
    pwdResetToken: string | null;
    
    @ApiProperty()
    @Column("timestamp", { name: "pwd_reset_expires", nullable: true })
    pwdResetExpires: Date | null;

    @ApiProperty({ enum: ['super_user', 'admin'], nullable: true })
    @Column({ 
        type: 'enum',
        enum: ['super_user', 'admin'],
        nullable: true,
        default: null
    })
    role: 'super_user' | 'admin' | null;

    @ApiProperty()
    @Column({ default: false })
    disabled: boolean;

    @OneToMany(() => Capsule, capsule => capsule.user)
    capsules?: Capsule[];

    // New relation: all subscriptions for this user
    @OneToMany(() => UserSubscription, userSubscription => userSubscription.userId)
    userSubscriptions?: UserSubscription[];

    // Admin helper methods
    isAdmin(): boolean {
        return this.role === 'admin' || this.role === 'super_user';
    }

    isSuperUser(): boolean {
        return this.role === 'super_user';
    }

    canManageUsers(): boolean {
        return this.isSuperUser(); // Only super users can manage other users
    }

    isActive(): boolean {
        return !this.disabled;
    }

    hasAdminAccess(): boolean {
        return this.isAdmin() && this.isActive();
    }

//    isFreeUser(): boolean {
//        return this.subscriptionStatus === 'free';
//    }

}