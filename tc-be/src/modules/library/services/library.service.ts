import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseService } from "src/common/services/base.service";
import { CapsuleContentRow } from "src/common/services/sqlite/interfaces";
import { SQLiteService } from "src/common/services/sqlite/sqlite.service";
import { Repository } from "typeorm";
import { LibraryItem } from "../entities/library-item.entity";

@Injectable()
export class LibraryService extends BaseService<LibraryItem> {
    constructor(
        @InjectRepository(LibraryItem)
        repository: Repository<LibraryItem>,
        private readonly sqliteService: SQLiteService
    ) {
        super(repository);
    }

    protected async checkOwnership(id: number, userId: number): Promise<boolean> {
        const item = await this.repository.findOne({
            where: { id, userId }
        });
        return !!item;
    }

    async findByUser(userId: number): Promise<LibraryItem[]> {
        return this.findAll({
            where: { userId },
            order: { 
                created: 'DESC'
            }
        });
    }

    async addContent(userId: number, content: CapsuleContentRow): Promise<any> {
        const contentId = await this.sqliteService.addContent(userId, content);
        if (contentId === null) {
            return null;
        }

        // Create metadata entry in main database
        const item = {
            userId,
            contentId,
            contentType: content.contentType,
            size: content.content.length,
            name: content.name
        };
        return this.create(item);
    }

    async addExternalUrl(userId: number, url: string, contentType: string, name?: string, size?: number): Promise<any> {
        // Create metadata entry in main database for external URL
        const item = {
            userId,
            url,
            contentId: null, // No content stored locally
            contentType,
            size: size || null,
            name: name || `External-${Date.now()}`
        };
        return this.create(item);
    }

    async findAllItems(userId: number): Promise<any[]> {
        const items = await this.findByUser(userId);

        return items.map(item => ({
            id: item.id,
            contentId: item.contentId,
            url: item.url,
            contentType: item.contentType,
            size: item.size,
            name: item.name,
            created: item.created,
            updated: item.updated
        }));
    }

    async findContent(userId: number, itemId: number): Promise<any> {
        // Get metadata from main database
        const item = await this.repository.findOne({
            where: { id: itemId, userId }
        });

        if (!item) {
            return null;
        }

        // Get content from SQLite
        const content = await this.sqliteService.getContentById(userId, item.contentId);
        if (!content) {
            return {
                ...item,
                content: null
            };
        }

        return {
            ...item,
            content: content.content,
            contentType: content.contentType
        };
    }

    async removeContent(userId: number, itemId: number): Promise<boolean> {
        // Get item metadata
        const item = await this.repository.findOne({
            where: { id: itemId, userId }
        });

        if (!item) {
            return false;
        }

        // For external URLs, we don't need to check content usage in SQLite
        if (item.url && !item.contentId) {
            // Simply remove the metadata for external URLs
            await this.repository.delete(itemId);
            return true;
        }

        // For file content, check if content is used in any capsules
        if (item.contentId) {
            const isInUse = await this.isContentInUse(item.contentId);
            if (isInUse) {
                return false; // Cannot delete content that is in use
            }

            // Remove content from SQLite
            const deleted = await this.sqliteService.removeContent(userId, item.contentId);
            if (!deleted) {
                return false;
            }
        }

        // Remove metadata
        await this.repository.delete(itemId);
        return true;
    }

    async isContentInUse(contentId: number): Promise<boolean> {
        const count = await this.repository.manager
            .createQueryBuilder()
            .select("COUNT(*)", "count")
            .from("items", "item") 
            .where("item.content_id = :contentId", { contentId })
            .getRawOne();
            
        return Number(count.count) > 0;
    }

}