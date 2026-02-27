import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import BetterSqlite3 from 'better-sqlite3-multiple-ciphers';
import * as fs from 'fs';
import * as path from 'path';
import { CapsuleContentRow } from './interfaces';
import { SQLiteConnectionManager } from './sqlite-connection-manager';

const TABLE_NAME = 'user_content';

@Injectable()
export class SQLiteService implements OnModuleInit {
    private dbPath: string;

    constructor(
        private readonly connectionManager: SQLiteConnectionManager,
        private readonly configService: ConfigService
    ) {
        // Get database path from environment config or use default
        const configPath = this.configService.get<string>('SQLITE_DB_PATH');

        this.dbPath = configPath
            ? path.resolve(configPath)
            : path.join(process.cwd(), 'data', 'user_capsules');
    }

    async onModuleInit() {
        await this.ensureDbDirectoryExists();
    }

    async createUserDatabase(userId: number): Promise<boolean> {
        try {
            await this.ensureDbDirectoryExists(userId);
            const dbFile = this.getUserDbPath(userId);

            // Check if file already exists
            const fileExists = fs.existsSync(dbFile);
            if (fileExists) {
                console.log(`Database file already exists for user ${userId}, checking permissions`);
                try {
                    fs.accessSync(dbFile, fs.constants.R_OK | fs.constants.W_OK);
                } catch (accessError) {
                    console.log(`Fixing permissions for existing database file for user ${userId}`);
                    fs.chmodSync(dbFile, 0o644);
                }
            }

            // Get or create the database connection
            const db = this.connectionManager.getConnection(dbFile);

            console.log(`Creating ${TABLE_NAME} table for user ${userId}`);
            try {
                // Use a transaction to ensure database consistency
                db.exec('BEGIN TRANSACTION;');

                // Create the table and index
                db.exec(`
                    CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        userId INTEGER NOT NULL,
                        capsuleId INTEGER DEFAULT NULL,
                        contentType TEXT NOT NULL,
                        size INTEGER,
                        content BLOB,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    );
                    CREATE INDEX IF NOT EXISTS idx_user_id ON ${TABLE_NAME}(userId);
                    CREATE INDEX IF NOT EXISTS idx_capsule_id ON ${TABLE_NAME}(capsuleId);
                `);

                db.exec('COMMIT;');
                console.log(`Successfully created database for user ${userId}`);
                return true;
            } catch (execError) {
                console.error(`Error creating tables for user ${userId}:`, execError);
                db.exec('ROLLBACK;');
                throw execError;
            }
        } catch (error) {
            console.error(`Failed to create database for user ${userId}:`, error);
            return false;
        }
    }

    /**
     * Adds content to the user's content repository
     * 
     * @param userId - The ID of the user to associate the content with
     * @param content - The content to be added
     * @returns A promise that resolves to the ID of the newly inserted content row, or `null` if failed
     */
    async addContent(userId: number, content: CapsuleContentRow): Promise<number | null> {
        try {
            console.log(`Adding content for user ${userId}, content type: ${content.contentType}, buffer size: ${content.content ? content.content.length : 'null'} bytes`);

            if (!this.validateContent(content)) {
                return null;
            }

            const db = await this.getUserDatabase(userId, true);
            if (!db) {
                console.error(`Failed to get database for user ${userId}`);
                return null;
            }

            try {
                const stmt = db.prepare(`
                    INSERT INTO ${TABLE_NAME} 
                    (userId, capsuleId, size, contentType, content)
                    VALUES (?, ?, ?, ?, ?)
                `);

                const result = stmt.run(
                    content.userId,
                    content.capsuleId ?? null,
                    content.size,
                    content.contentType,
                    content.content
                );

                const rowId = Number(result.lastInsertRowid);
                console.log(`Content added successfully for user ${userId}, new row ID: ${rowId}`);
                return isNaN(rowId) ? null : rowId;
            } catch (sqliteError) {
                throw sqliteError; // Re-throw if it's not a missing table issue
            }
        } catch (error) {
            console.error(`Failed to add content for user ${userId}:`, error);
            return null;
        }
    }


    /**
     * Retrieves content by its ID for a specific user
     * 
     * @param userId - The ID of the user whose database to access
     * @param contentId - The ID of the content to retrieve
     * @returns A promise that resolves to the content item if found
     */
    async getContentById(userId: number, contentId: number): Promise<CapsuleContentRow> {
        try {
            const db = await this.getUserDatabase(userId, true);
            if (!db) {
                return null;
            }

            const row = db.prepare<[number]>(`
                SELECT id, userId, capsuleId, contentType, content, created_at, updated_at
                FROM ${TABLE_NAME}
                WHERE id = ?
            `).get(contentId) as CapsuleContentRow;

            return row || null;
        } catch (error) {
            console.error('Failed to get content by ID:', error);
            return null;
        }
    }

    /**
     * Removes content from the user's repository
     * 
     * @param userId - The ID of the content owner
     * @param contentId - The ID of the content to remove
     * @returns A promise that resolves to true if successful
     */
    async removeContent(userId: number, contentId: number): Promise<boolean> {
        try {
            const db = await this.getUserDatabase(userId, true);
            if (!db) {
                return null;
            }

            const stmt = db.prepare<[number, number]>(`
                DELETE FROM ${TABLE_NAME} 
                WHERE id = ? AND userId = ?
            `);

            const result = stmt.run(contentId, userId);

            return result.changes > 0;
        } catch (error) {
            console.error('Failed to remove content:', error);
            return false;
        }
    }

    /**
     * Get Usage by User
     * 
     * @param userId - The ID of the user whose content to retrieve
     * @returns A promise that resolves to an array of content items
     */
    async getUsageByUser(userId: number): Promise<number> {
        try {
            const db = await this.getUserDatabase(userId, true);
            if (!db) {
                return null;
            }
            const row = db.prepare(`
                SELECT SUM(size) AS userUsage
                FROM ${TABLE_NAME}
                WHERE userId = ?
            `).get(userId) as { userUsage: number | null };
            return row.userUsage ?? 0;

        } catch (error) {
            console.error('Failed to get user usage:', error);
            return 0;
        }
    }

    /**
     * Get Usage by Capsule
     * 
     * @param userId - The ID of the user whose content to retrieve
     * @param capsuleId - The ID of the capsule whose content to retrieve or null for all capsules
     * @returns A promise that resolves to an array of content items
     */
    async getUsageByCapsule(userId: number, capsuleId: number = null): Promise<number> {
        try {
            const db = await this.getUserDatabase(userId, true);
            if (!db) {
                return null;
            }
            let row: { capsuleUsage: number | null };
            if (capsuleId !== null) {
                    row = db.prepare(`
                    SELECT SUM(size) AS capsuleUsage
                    FROM ${TABLE_NAME}
                    WHERE capsuleId = ?
                `).get(capsuleId) as { capsuleUsage: number | null };
            } else {
                    row = db.prepare(`
                    SELECT SUM(size) AS capsuleUsage
                    FROM ${TABLE_NAME}
                    WHERE capsuleId IS NOT NULL
                `).get() as { capsuleUsage: number | null };
            }
            return row.capsuleUsage ?? 0;
        } catch (error) {
            console.error('Failed to get capsule usage:', error);
            return 0;
        }
    }

    // --------------------------------------------------------
    // Support utilities
    // --------------------------------------------------------

    // * Constructs the path to the user's database file
    private getUserDbPath(userId: number): string {
        const userIdStr = String(userId).padStart(8, '0');
        return path.join(this.dbPath, `${userIdStr}/user_${userIdStr}.db`);
    }

    // * Ensures the database directory exists and is writable
    private async ensureDbDirectoryExists(userId?: number): Promise<void> {
        const dbPath = userId ? String(userId).padStart(8, '0') : this.dbPath;
        console.log(`Ensuring directory exists at ${path}`);
        try {
            if (!fs.existsSync(dbPath)) {
                console.log(`Creating directory at ${dbPath}`);
                fs.mkdirSync(dbPath, { recursive: true, mode: 0o755 });
            }

            // Check if directory is writable
            try {
                const testFile = path.join(dbPath, '.test_write');
                fs.writeFileSync(testFile, 'test');
                fs.unlinkSync(testFile);
                console.log(`Directory at ${dbPath} is writable`);
            } catch (writeError) {
                console.error(`Directory at ${dbPath} is not writable:`, writeError);
                throw new Error(`Directory is not writable: ${writeError.message}`);
            }
        } catch (error) {
            console.error('Failed to create or check directory:', error);
            throw error;
        }
    }

    // * Retrieves the user's database connection, creating it if necessary
    private async getUserDatabase(userId: number, autoCreate: boolean = false): Promise<BetterSqlite3.Database | null> {
        try {
            // First ensure the directory exists
            await this.ensureDbDirectoryExists(userId);
            const dbFile = this.getUserDbPath(userId);
            console.log(`Accessing database file: ${dbFile}`);

            if (!fs.existsSync(dbFile)) {
                if (autoCreate) {
                    console.log(`Database file doesn't exist, creating for user ${userId}`);
                    const created = await this.createUserDatabase(userId);
                    if (!created) {
                        console.error(`Failed to create database for user ${userId}`);
                        return null;
                    }
                    console.log(`Database file created for user ${userId}`);
                } else {
                    console.log(`Database file doesn't exist for user ${userId} and autoCreate is false`);
                    return null;
                }
            }

            // Check if file is readable and writable
            try {
                fs.accessSync(dbFile, fs.constants.R_OK | fs.constants.W_OK);
                console.log(`Database file is readable and writable for user ${userId}`);
            } catch (accessError) {
                console.error(`Database file permissions issue for user ${userId}:`, accessError);

                // Try to fix permissions
                try {
                    fs.chmodSync(dbFile, 0o644);
                    console.log(`Updated permissions for database file of user ${userId}`);
                } catch (chmodError) {
                    console.error(`Failed to update permissions for user ${userId}:`, chmodError);
                }
            }

            return this.connectionManager.getConnection(dbFile);
        } catch (error) {
            console.error(`Failed to get database connection for user ${userId}:`, error);
            return null;
        }
    }

    // * Calculate the size of the user's database file
    async calculateUserDatabaseSize(userId: number): Promise<number> {
        try {
            if (!userId || typeof userId !== 'number') {
                console.error('Invalid userId provided to calculateUserDatabaseSize:', userId);
                return 0;
            }

            const dbFile = this.getUserDbPath(userId);

            try {
                const stats = await fs.promises.stat(dbFile);
                return stats.size; // Return bytes for better precision
            } catch (fileError) {
                console.log(`Database file not found for user ${userId}: ${dbFile}`);
                return 0;
            }
        } catch (error) {
            console.error('Error calculating user database size:', error);
            return 0;
        }
    }

    // * Compact the user's SQLite database to reduce file size
    async compactDatabase(userId: number): Promise<void> {
        const dbPath = this.getUserDbPath(userId);
        const okDbPath = `${dbPath}.ok`;

        try {
            console.log(`[COMPACT] Starting compaction for ${dbPath}`);

            // Step 1-3: Close and rename the original DB
            this.connectionManager.closeConnection(dbPath);
            fs.renameSync(dbPath, okDbPath);

            // Step 4-5: Open .ok DB and compact to original path
            const sourceDb = this.connectionManager.getConnection(okDbPath);
            sourceDb.prepare(`VACUUM INTO '${dbPath}'`).run();
            this.connectionManager.closeConnection(okDbPath);

            // Step 6-7: Open and validate the new compacted DB
            const validatedDb = this.connectionManager.getConnection(dbPath);
            const result: any = validatedDb.prepare("PRAGMA integrity_check").get();

            if (result.integrity_check !== 'ok') {
                throw new Error(`Integrity check failed on compacted DB: ${dbPath}`);
            }

            // ✅ Compaction was successful — delete the .ok backup
            fs.unlinkSync(okDbPath);
            console.log(`[COMPACT] Compaction complete and backup deleted: ${dbPath}`);
        } catch (error) {
            console.error(`[COMPACT] Error during compaction for ${dbPath}:`, error);

            // Restore the original DB if something went wrong
            this.connectionManager.closeConnection(dbPath);
            this.connectionManager.closeConnection(okDbPath);

            if (fs.existsSync(okDbPath)) {
                if (fs.existsSync(dbPath)) {
                    fs.unlinkSync(dbPath);
                }
                fs.renameSync(okDbPath, dbPath);
                console.warn(`[COMPACT] Restored original DB from backup.`);
            }

            // Reopen the restored DB
            this.connectionManager.getConnection(dbPath);
        }
    }

    // * Validates the content object structure
    private validateContent(content: CapsuleContentRow): boolean {
        let isValid = true;
        if (!content) {
            console.error('Content object is null or undefined');
            isValid = false;
        }

        if (!content.contentType || typeof content.contentType !== 'string') {
            console.error('Invalid contentType in content:', content.contentType);
            isValid = false;
        }

        if (!content.content) {
            console.error('Content buffer is null or undefined');
            isValid = false;
        }

        if (!(content.content instanceof Buffer)) {
            console.error('Content is not a Buffer instance, type:', typeof content.content);
            // Try to convert to Buffer if it's an ArrayBuffer or similar
            try {
                if (content.content instanceof ArrayBuffer ||
                    (typeof content.content === 'object' && content.content !== null && 'buffer' in content.content)) {
                    content.content = Buffer.from(content.content);
                }
            } catch (e) {
                console.error('Failed to convert content to Buffer:', e);
                isValid = false;
            }
        }
        return isValid;
    }

}