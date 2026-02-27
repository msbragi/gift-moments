import { Controller, Get, NotFoundException, Param, Res, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { User } from "src/common/decorators/user.decorator";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { SQLiteService } from "src/common/services/sqlite/sqlite.service";

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('/api/v1')
export class ContentsController {
  constructor(private readonly sqliteService: SQLiteService) {}

  @Get('library/items/content/:id')
  @ApiTags('library')
  @ApiOperation({ summary: 'Get library item content by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Content ID' })
  @ApiResponse({ status: 200, description: 'Content from library retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Content not found' })
  async getLibraryItemContent(
    @User('userId') userId: number,
    @Param('id') idParam: string,
    @Res() res: Response
  ) {
    await this.handleContentRetrieval(userId, idParam, res);
  }

  @Get('capsules/:capsuleId/items/:itemId/content/:id')
  @ApiTags('capsules')
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

  private async handleContentRetrieval(
    userId: number,
    contentIdParam: string,
    res: Response
  ) {
    try {
      const contentId = parseInt(contentIdParam, 10);
      const data = await this.sqliteService.getContentById(userId, contentId);

      if (!data) {
        throw new NotFoundException('Content not found');
      }

      res.setHeader('Content-Type', data.contentType);
      return res.send(data.content);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException('Content not found or access denied');
    }
  }
}