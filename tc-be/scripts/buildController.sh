#!/bin/bash

# Create User Controller
cat > src/modules/users/controllers/users.controller.ts << 'EOF'
import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@ApiTags('users')
@ApiBearerAuth()
@Controller('api/v1/users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    @ApiOperation({ summary: 'Create user' })
    @ApiResponse({ status: 201, type: User })
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Find all users' })
    @ApiResponse({ status: 200, type: [User] })
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Find user by id' })
    @ApiResponse({ status: 200, type: User })
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(+id);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Update user' })
    @ApiResponse({ status: 200, type: User })
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(+id, updateUserDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Delete user' })
    @ApiResponse({ status: 200 })
    remove(@Param('id') id: string) {
        return this.usersService.remove(+id);
    }
}
EOF

# Create Capsule Controller
cat > src/modules/capsules/controllers/capsules.controller.ts << 'EOF'
import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CapsulesService } from '../services/capsules.service';
import { CreateCapsuleDto } from '../dto/create-capsule.dto';
import { UpdateCapsuleDto } from '../dto/update-capsule.dto';
import { Capsule } from '../entities/capsule.entity';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@ApiTags('capsules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/capsules')
export class CapsulesController {
    constructor(private readonly capsulesService: CapsulesService) {}

    @Post()
    @ApiOperation({ summary: 'Create capsule' })
    @ApiResponse({ status: 201, type: Capsule })
    create(@Body() createCapsuleDto: CreateCapsuleDto) {
        return this.capsulesService.create(createCapsuleDto);
    }

    @Get()
    @ApiOperation({ summary: 'Find all capsules' })
    @ApiResponse({ status: 200, type: [Capsule] })
    findAll() {
        return this.capsulesService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Find capsule by id' })
    @ApiResponse({ status: 200, type: Capsule })
    findOne(@Param('id') id: string) {
        return this.capsulesService.findOne(+id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update capsule' })
    @ApiResponse({ status: 200, type: Capsule })
    update(@Param('id') id: string, @Body() updateCapsuleDto: UpdateCapsuleDto) {
        return this.capsulesService.update(+id, updateCapsuleDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete capsule' })
    @ApiResponse({ status: 200 })
    remove(@Param('id') id: string) {
        return this.capsulesService.remove(+id);
    }
}
EOF

# Create Items Controller
cat > src/modules/items/controllers/items.controller.ts << 'EOF'
import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ItemsService } from '../services/items.service';
import { CreateItemDto } from '../dto/create-item.dto';
import { UpdateItemDto } from '../dto/update-item.dto';
import { Item } from '../entities/item.entity';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@ApiTags('items')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/items')
export class ItemsController {
    constructor(private readonly itemsService: ItemsService) {}

    @Post()
    @ApiOperation({ summary: 'Create item' })
    @ApiResponse({ status: 201, type: Item })
    create(@Body() createItemDto: CreateItemDto) {
        return this.itemsService.create(createItemDto);
    }

    @Get()
    @ApiOperation({ summary: 'Find all items' })
    @ApiResponse({ status: 200, type: [Item] })
    findAll() {
        return this.itemsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Find item by id' })
    @ApiResponse({ status: 200, type: Item })
    findOne(@Param('id') id: string) {
        return this.itemsService.findOne(+id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update item' })
    @ApiResponse({ status: 200, type: Item })
    update(@Param('id') id: string, @Body() updateItemDto: UpdateItemDto) {
        return this.itemsService.update(+id, updateItemDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete item' })
    @ApiResponse({ status: 200 })
    remove(@Param('id') id: string) {
        return this.itemsService.remove(+id);
    }
}
EOF

# Create Recipients Controller
cat > src/modules/recipients/controllers/recipients.controller.ts << 'EOF'
import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RecipientsService } from '../services/recipients.service';
import { CreateRecipientDto } from '../dto/create-recipient.dto';
import { UpdateRecipientDto } from '../dto/update-recipient.dto';
import { Recipient } from '../entities/recipient.entity';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@ApiTags('recipients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/recipients')
export class RecipientsController {
    constructor(private readonly recipientsService: RecipientsService) {}

    @Post()
    @ApiOperation({ summary: 'Create recipient' })
    @ApiResponse({ status: 201, type: Recipient })
    create(@Body() createRecipientDto: CreateRecipientDto) {
        return this.recipientsService.create(createRecipientDto);
    }

    @Get()
    @ApiOperation({ summary: 'Find all recipients' })
    @ApiResponse({ status: 200, type: [Recipient] })
    findAll() {
        return this.recipientsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Find recipient by id' })
    @ApiResponse({ status: 200, type: Recipient })
    findOne(@Param('id') id: string) {
        return this.recipientsService.findOne(+id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update recipient' })
    @ApiResponse({ status: 200, type: Recipient })
    update(@Param('id') id: string, @Body() updateRecipientDto: UpdateRecipientDto) {
        return this.recipientsService.update(+id, updateRecipientDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete recipient' })
    @ApiResponse({ status: 200 })
    remove(@Param('id') id: string) {
        return this.recipientsService.remove(+id);
    }
}
EOF
