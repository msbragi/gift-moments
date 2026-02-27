import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Capsule } from './entities/capsule.entity';
import { CapsulesService } from './services/capsules.service';
import { CapsulesController } from './controllers/capsules.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([Capsule])
    ],
    providers: [CapsulesService],
    controllers: [CapsulesController],
    exports: [CapsulesService],
})
export class CapsulesModule {}
