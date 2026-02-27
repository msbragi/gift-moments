import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Capsule } from '../../capsules/entities/capsule.entity';
import { IItem } from 'src/common/interfaces/models.interface';
import { ApiProperty } from '@nestjs/swagger';

@Entity('items')
export class Item extends BaseEntity implements IItem {
    @Column({ name: 'capsule_id' })
    @ApiProperty()
    capsuleId: number;

    @Column()
    @ApiProperty()
    name: string;

    @Column({ name: 'content_type' })
    @ApiProperty()
    contentType: string;

    @Column({ name: 'url', nullable: true })
    @ApiProperty({ required: false })
    url: string;

    @Column({ name: 'size', nullable: true })
    @ApiProperty({ required: false })
    size: number;

    @Column({ name: 'content_id', nullable: true })
    @ApiProperty({ required: false })
    contentId: number;

    @ManyToOne(() => Capsule, capsule => capsule.items)
    @JoinColumn({ name: 'capsule_id' })
    capsule: Capsule;
}