import { Controller, Get, Param, Res, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { User } from "src/common/decorators/user.decorator";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { SQLiteService } from "src/common/services/sqlite/sqlite.service";
import { BaseContentController } from "./base-content.controller";

@ApiTags('capsules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('/api/v1/capsules/:capsuleId/items/:itemId/content')
export class CapsuleContentController extends BaseContentController {
  constructor(sqliteService: SQLiteService) {
    super(sqliteService);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get capsule item content by ID' })
  @ApiParam({ name: 'capsuleId', type: Number, description: 'Capsule ID' })
  @ApiParam({ name: 'itemId', type: Number, description: 'Item ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Content ID' })
  @ApiResponse({ status: 200, description: 'Content from item retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Content not found' })
  async getCapsuleItemContent(
    @User('userId') userId: number,
    @Param('capsuleId') capsuleId: string,
    @Param('itemId') itemId: string,
    @Param('id') idParam: string,
    @Res() res: Response
  ) {
    await this.handleContentRetrieval(userId, idParam, res);
  }
}