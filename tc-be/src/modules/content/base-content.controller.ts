import { NotFoundException, Res } from "@nestjs/common";
import { Response } from "express";
import { SQLiteService } from "src/common/services/sqlite/sqlite.service";

export abstract class BaseContentController {
  constructor(protected readonly sqliteService: SQLiteService) {}

  protected async handleContentRetrieval(
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