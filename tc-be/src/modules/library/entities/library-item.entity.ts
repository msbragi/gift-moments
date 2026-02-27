import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ILibraryItem } from 'src/common/interfaces/models.interface';

@Entity('library_items')
export class LibraryItem extends BaseEntity implements ILibraryItem {

    @Column({ name: 'user_id' })
    @ApiProperty()
    userId: number;

    @Column({ name: 'content_id', nullable: true })
    @ApiProperty({ required: false })
    contentId: number | null;

    @Column({ name: 'content_type' })
    @ApiProperty({ required: false })
    contentType: string;

    @Column({ name: 'url', nullable: true })
    @ApiProperty({ required: false })
    url: string | null;

    @Column({ nullable: true })
    @ApiProperty({ required: false })
    size: number | null;

    @Column()
    @ApiProperty()
    name: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

}