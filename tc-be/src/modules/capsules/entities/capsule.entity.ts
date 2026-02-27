import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ICapsule } from '../../../common/interfaces/models.interface';
import { User } from '../../users/entities/user.entity';
import { Item } from '../../items/entities/item.entity';
import { Recipient } from '../../recipients/entities/recipient.entity';
import { UserSubscription } from 'src/modules/subscriptions/entities/user-subscription.entity';

@Entity('capsules')
export class Capsule extends BaseEntity implements ICapsule {
    @ApiProperty()
    @Column({name: 'user_id', nullable: false})
    userId: number;

    @ApiProperty()
    @Column({nullable: false})
    name: string;

    @ApiProperty()
    @Column()
    description: string;

    @ApiProperty()
    @Column({name: 'open_date', nullable: true})
    openDate: Date;

    @ApiProperty()
    @Column({name: 'is_open', nullable: true})  
    isOpen?: boolean;

    @ApiProperty()
    @Column({name: 'is_public', nullable: true})  
    isPublic?: boolean;

    @ApiProperty()
    @Column({name: 'is_physical', nullable: true})  
    isPhysical?: boolean;

    @ApiProperty()
    @Column({ nullable: true })
    lat?: string;

    @ApiProperty()
    @Column({ nullable: true })
    lng?: string;

    // Computed fields (not stored in database)
    @ApiProperty()
    itemsCount?: number;

    @ApiProperty()
    recipientsCount?: number;

    @ManyToOne(() => User, user => user.capsules)
    @JoinColumn({ name: 'user_id' })  // Add this to explicitly define join column
    user?: User;

    @OneToMany(() => Item, item => item.capsule)
    items?: Item[];

    @OneToMany(() => Recipient, recipient => recipient.capsule)
    recipients?: Recipient[];

    @OneToMany(() => UserSubscription, subscription => subscription.capsule)
    subscriptions?: UserSubscription[];    
}
