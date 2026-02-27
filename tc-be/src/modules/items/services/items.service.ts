import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseService } from "src/common/services/base.service";
import { CapsuleContentRow } from "src/common/services/sqlite/interfaces";
import { SQLiteService } from "src/common/services/sqlite/sqlite.service";
import { CapsulesService } from "src/modules/capsules/services/capsules.service";
import { LibraryService } from "src/modules/library/services/library.service";
import { Repository } from "typeorm";
import { Item } from "../entities/item.entity";

@Injectable()
export class ItemsService extends BaseService<Item> {
    constructor(
        @InjectRepository(Item)
        repository: Repository<Item>,
        private readonly sqliteService: SQLiteService,
        private readonly capsulesService: CapsulesService,
        private readonly libraryService: LibraryService,
    ) {
        super(repository);
    }

    protected async checkOwnership(id: number, userId: number): Promise<boolean> {
        const item = await this.repository.findOne({
            where: { id },
            relations: ['capsule'],
        });
        return !!item && item.capsule.userId === userId;
    }

    async findByUser(userId: number): Promise<Item[]> {
        return this.findAll({
            relations: ['capsule'],
            where: {
                capsule: {
                    userId
                }
            },
            order: {
                created: 'DESC'
            }
        });
    }

    async findOneByCapsule(capsuleId: number): Promise<Item[]> {
        return this.findAll({
            where: { capsuleId },
            order: { created: 'DESC' }
        });
    }

    async addContent(userId: number, capsuleId: number, content: CapsuleContentRow, name?: string): Promise<any> {
        // Verify user owns the capsule
        await this.capsulesService.findOneByUser(capsuleId, userId);

        const contentId = await this.sqliteService.addContent(userId, content);
        if (contentId === null) {
            return null;
        }

        // Create metadata entry in main database
        const item = {
            capsuleId,
            contentId,
            contentType: content.contentType,
            size: content.content.length,
            name: content.name
        };
        return this.create(item);
    }

    async findAllItems(userId: number, capsuleId: number): Promise<any[]> {
        // No changes needed here - this method doesn't directly interact with SQLite
        // Verify user owns the capsule
        await this.capsulesService.findOneByUser(capsuleId, userId);
        // Get metadata from main database
        const items = await this.findOneByCapsule(capsuleId);

        return items.map(item => ({
            id: item.id,
            contentId: item.contentId,
            contentType: item.contentType,
            size: item.size,
            name: item.name,
            url: item.url,
            created: item.created,
            updated: item.updated
        }));
    }

    async findContent(userId: number, capsuleId: number, itemId: number): Promise<any> {
        // Verify user owns the capsule
        await this.capsulesService.findOneByUser(capsuleId, userId);

        // Get metadata from main database
        const item = await this.repository.findOne({
            where: { id: itemId, capsuleId }
        });

        if (!item) {
            return null;
        }

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

    async removeContent(userId: number, capsuleId: number, itemId: number): Promise<boolean> {
        // No changes needed here - this already works with contentId
        // Verify user owns the capsule
        await this.capsulesService.findOneByUser(capsuleId, userId);

        // Get item metadata
        const item = await this.repository.findOne({
            where: { id: itemId, capsuleId }
        });

        if (!item) {
            return false;
        }

        // Remove content from SQLite using contentId
        // const deleted = await this.sqliteService.removeContent(userId, item.contentId);
        // if (!deleted) {
        //    return false;
        //}

        // Remove metadata
        await this.repository.delete(itemId);
        return true;
    }

/**
 * Add a library item to a capsule (metadata only)
 * @param userId The ID of the authenticated user
 * @param capsuleId The ID of the target capsule
 * @param libraryItemId The ID of the library item to reference
 * @returns The newly created capsule item or null if the operation fails
 */
async addFromLibrary(userId: number, capsuleId: number, libraryItemId: number): Promise<any> {
    try {
        // Verify user owns the capsule
        await this.capsulesService.findOneByUser(capsuleId, userId);
        
        // Get the library item to ensure it exists and belongs to the user
        const libraryItem = await this.libraryService.findOneByUser(libraryItemId, userId);
        
        if (!libraryItem) {
            return null;
        }
        
        // Create metadata entry in main database referencing the library item's content
        const item = {
            capsuleId,
            contentId: libraryItem.contentId,
            contentType: libraryItem.contentType,
            size: libraryItem.size,
            name: libraryItem.name,
            url: libraryItem.url // Copy URL for external content
        };
        
        const newItem = await this.create(item);
        
        return {
            id: newItem.id,
            contentId: newItem.contentId,
            contentType: newItem.contentType,
            size: newItem.size,
            name: newItem.name,
            url: newItem.url, // Include URL in response
            created: newItem.created,
            updated: newItem.updated
        };
    } catch (error) {
        return null;
    }
}

    /**
     * Add external URL to a capsule
     */
    async addExternalUrl(
        userId: number,
        capsuleId: number,
        url: string,
        contentType: string,
        name?: string,
        size?: number
    ): Promise<any> {
        try {
            // Verify user owns the capsule
            await this.capsulesService.findOneByUser(capsuleId, userId);

            // Create metadata entry in main database with external URL
            const item = {
                capsuleId,
                contentId: null, // No contentId for external URLs
                contentType,
                size: size || null,
                name: name || `External-${Date.now()}`,
                url: url // Store the external URL
            };

            const newItem = await this.create(item);
            if (!newItem) {
                return null;
            }

            return {
                id: newItem.id,
                contentId: newItem.contentId,
                contentType: newItem.contentType,
                size: newItem.size,
                name: newItem.name,
                url: newItem.url,
                created: newItem.created,
                updated: newItem.updated
            };
        } catch (error) {
            console.error('Error adding external URL to capsule:', error);
            return null;
        }
    }
}