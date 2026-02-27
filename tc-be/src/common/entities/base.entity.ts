import { CreateDateColumn, UpdateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IBase } from '../interfaces/models.interface';

export abstract class BaseEntity implements IBase {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty()
    @CreateDateColumn()
    created: Date;

    @ApiProperty()
    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updated: Date;

    @ApiProperty()
    @DeleteDateColumn({ nullable: true })
    deleted: Date | null;
}
