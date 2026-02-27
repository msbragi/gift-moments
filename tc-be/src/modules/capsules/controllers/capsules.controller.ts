import { Body, Controller, Get, NotFoundException, NotImplementedException, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '../../../common/decorators/user.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { UpdateCapsuleDto } from '../dto/update-capsule.dto';
import { Capsule } from '../entities/capsule.entity';
import { CapsulesService } from '../services/capsules.service';

@ApiTags('capsules')
@ApiBearerAuth('jwt-auth')
@UseGuards(JwtAuthGuard)
@Controller('api/v1/capsules')
export class CapsulesController {
    constructor(
        private readonly capsulesService: CapsulesService
    ) { }

    @Get()
    @ApiOperation({ summary: 'Find all capsules of current logged in user' })
    @ApiResponse({ status: 200, type: Capsule })
    findAll(@User('userId') userId: number) {
        return this.capsulesService.findAllByUser(userId)
    }

    @Get('count')
    @ApiOperation({ summary: 'Return total number of capsules created' })
    @ApiResponse({ status: 200 })
    async count() {
        return this.capsulesService.count();
    }

    @Get('public')
    @ApiOperation({ summary: 'Return total number of capsules created' })
    @ApiResponse({ status: 200 })
    async public() {
        return this.capsulesService.getAllPublic();
    }

    @Get('assigned')
    @ApiOperation({ summary: 'Get capsules assigned to current user as recipient' })
    @ApiResponse({ status: 200, type: [Capsule] })
    async getAssigned(@User('email') userEmail: string) {
        return this.capsulesService.getAssignedCapsules(userEmail);
    }

    @Get('assigned/:id')
    @ApiOperation({ summary: 'Get specific capsule assigned to current user as recipient' })
    @ApiResponse({ status: 200, type: Capsule })
    async getAssignedCapsule(
        @Param('id') id: string,
        @User('email') userEmail: string
    ) {
        const capsule = await this.capsulesService.getAssignedCapsule(+id, userEmail);
        if (!capsule) {
            throw new NotFoundException(`Assigned capsule with id: ${id} not found`);
        }

        // Mark as opened if eligible (handled by service layer)
        await this.capsulesService.markAsOpenedIfEligible(+id, userEmail);

        return capsule;
    }

    @Get(':id')
    @ApiOperation({ summary: 'Find a capsule by id' })
    @ApiResponse({ status: 200, type: Capsule })
    async findOne(@Param('id') id: string, @User('userId') userId: number) {
        const capsule = await this.capsulesService.findOneByUser(+id, userId);
        if (!capsule) {
            throw new NotFoundException(`Capsule width id: ${id} not found`);
        }
        return capsule;
    }

    /*
    ** Create and delete are not anymore frontend actions
    @Post()
    @ApiOperation({ summary: 'Create capsule for current user' })
    @ApiResponse({ status: 201, type: Capsule })
    create(@Body() createCapsuleDto: CreateCapsuleDto, @User('userId') userId: number) {
        return this.capsulesService.createByUser(createCapsuleDto, userId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete capsule for current user' })
    @ApiResponse({ status: 200 })
    remove(@Param('id') id: string, @User('userId') userId: number) {
        return this.capsulesService.removeByUser(+id, userId);
    }
    */

    @Post('reset/:id')
    @ApiOperation({ summary: 'Reset a capsule for current user' })
    @ApiResponse({ status: 200 })
    reset(@Param('id') id: string, @User('userId') userId: number) {
        throw new NotImplementedException('Reset capsule is not implemented yet.');
        //return this.capsulesService.removeByUser(+id, userId);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update capsule for current user' })
    @ApiResponse({ status: 200, type: Capsule })
    update(@Param('id') id: string, @Body() updateCapsuleDto: UpdateCapsuleDto, @User('userId') userId: number) {
        return this.capsulesService.updateByUser(+id, userId, updateCapsuleDto);
    }

}
