import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as BetterSqlite3 from 'better-sqlite3-multiple-ciphers';
import { Database } from 'better-sqlite3-multiple-ciphers';
import * as fs from 'fs';

interface Connection {
    db: Database;
    lastAccess: number;
    closeTimer?: NodeJS.Timeout;
}

interface ConnectionPool {
    [dbPath: string]: Connection;
}

@Injectable()
export class SQLiteConnectionManager implements OnModuleDestroy {
    private pool: ConnectionPool = {};
    private readonly connectionTimeout = 5 * 60 * 1000; // 5 minutes
    private readonly encryptionKey: string;

    constructor(private configService: ConfigService) {
        this.encryptionKey = this.configService.get<string>('SQLITE_ENCRYPTION_KEY', '');
    }

    getConnection(dbPath: string): Database {
        try {
            console.log(`Requesting database connection for: ${dbPath}`);
            
            // Return existing connection if available
            if (this.pool[dbPath]) {
                console.log(`Using existing connection from pool for: ${dbPath}`);
                this.refreshConnection(dbPath);
                return this.pool[dbPath].db;
            }

            // Ensure parent directory exists
            const dirPath = dbPath.substring(0, dbPath.lastIndexOf('/'));
            if (!fs.existsSync(dirPath)) {
                console.log(`Creating parent directory for database: ${dirPath}`);
                fs.mkdirSync(dirPath, { recursive: true, mode: 0o755 });
            }

            // Create options object for connection
            const options: BetterSqlite3.Options = {
                fileMustExist: false,
                readonly: false,
                verbose: console.log // Log all SQL queries for debugging
            };

            console.log(`Creating new SQLite connection for: ${dbPath}`);
            // Create new connection
            const db = new BetterSqlite3(dbPath, options);
            
            // Configure encryption if key is available
            if (this.encryptionKey) {
                console.log(`Setting up encryption for database: ${dbPath}`);
                // Set to use standard SQLCipher encryption (compatible with DB Browser)
                db.pragma(`cipher='sqlcipher'`);
                db.pragma(`legacy=4`);
                
                // Check if this is a new database (doesn't exist or is empty)
                const isNewDb = !fs.existsSync(dbPath) || fs.statSync(dbPath).size === 0;
                
                if (isNewDb) {
                    console.log(`Initializing new encrypted database: ${dbPath}`);
                    // For new database, set the key
                    db.pragma(`key='${this.escapePragmaValue(this.encryptionKey)}'`);
                } else {
                    // For existing database, try to open with key
                    try {
                        console.log(`Opening existing encrypted database: ${dbPath}`);
                        db.pragma(`key='${this.escapePragmaValue(this.encryptionKey)}'`);
                        
                        // Verify the database is readable (will throw if key is wrong)
                        db.prepare('SELECT 1').get();
                        console.log(`Successfully opened encrypted database: ${dbPath}`);
                    } catch (error) {
                        console.error(`Failed to decrypt database ${dbPath}:`, error);
                        throw new Error(`Cannot decrypt database with provided key: ${dbPath}`);
                    }
                }
            }
            
            // Configure database settings for optimal performance and safety
            db.pragma('journal_mode = WAL'); // Write-Ahead Logging for better concurrency
            db.pragma('synchronous = NORMAL'); // Good balance between durability and performance
            db.pragma('foreign_keys = ON'); // Enforce foreign key constraints
            
            this.pool[dbPath] = {
                db,
                lastAccess: Date.now()
            };

            this.startConnectionTimer(dbPath);
            console.log(`Successfully established connection to: ${dbPath}`);
            return db;
        } catch (error) {
            console.error(`Failed to establish connection to database ${dbPath}:`, error);
            throw error;
        }
    }

    /**
     * Escape single quotes in pragma values to prevent SQL injection
     * @param value The value to escape
     * @returns The escaped value
     */
    private escapePragmaValue(value: string): string {
        return value.replace(/'/g, "''");
    }

    /**
     * Change the encryption key for a database
     * @param dbPath Path to the database file
     * @param newKey New encryption key
     * @returns true if successful, false otherwise
     */
    changeEncryptionKey(dbPath: string, newKey: string): boolean {
        try {
            // Close existing connection if any
            this.closeConnection(dbPath);
            
            // Open with current key
            const db = this.getConnection(dbPath);
            
            // Change the key
            db.pragma(`rekey='${this.escapePragmaValue(newKey)}'`);
            
            // Close connection to ensure changes are written
            this.closeConnection(dbPath);
            
            return true;
        } catch (error) {
            console.error(`Failed to change encryption key for ${dbPath}:`, error);
            return false;
        }
    }

    /**
     * Create an unencrypted copy of an encrypted database
     * @param sourcePath Path to the encrypted database
     * @param destPath Path to save the unencrypted database
     * @returns true if successful, false otherwise
     */
    decryptDatabase(sourcePath: string, destPath: string): boolean {
        try {
            // Close connections to source if any
            this.closeConnection(sourcePath);
            
            // Get connection with encryption key
            const sourceDb = this.getConnection(sourcePath);
            
            // Export to unencrypted database
            sourceDb.pragma(`cipher='sqlcipher'`);
            sourceDb.pragma(`legacy=4`);
            sourceDb.pragma(`rekey=''`); // Empty key = unencrypted
            
            // Close to ensure changes are written
            this.closeConnection(sourcePath);
            
            // Copy the now-unencrypted database to destination
            fs.copyFileSync(sourcePath, destPath);
            
            // Re-encrypt the source database
            const db = new BetterSqlite3(sourcePath);
            db.pragma(`key=''`); // Open unencrypted
            db.pragma(`rekey='${this.escapePragmaValue(this.encryptionKey)}'`); // Re-encrypt
            db.close();
            
            return true;
        } catch (error) {
            console.error(`Failed to decrypt database ${sourcePath}:`, error);
            return false;
        }
    }

    private refreshConnection(dbPath: string): void {
        if (this.pool[dbPath]) {
            this.pool[dbPath].lastAccess = Date.now();
            this.startConnectionTimer(dbPath);
        }
    }

    private startConnectionTimer(dbPath: string): void {
        // Clear existing timer if any
        this.clearTimer(dbPath);

        // Set new timer
        this.pool[dbPath].closeTimer = setTimeout(() => {
            this.closeConnection(dbPath);
        }, this.connectionTimeout);
    }

    private clearTimer(dbPath: string): void {
        if (this.pool[dbPath]?.closeTimer) {
            clearTimeout(this.pool[dbPath].closeTimer);
            this.pool[dbPath].closeTimer = undefined;
        }
    }

    closeConnection(dbPath: string): void {
        if (!this.pool[dbPath]) return;

        this.clearTimer(dbPath);
        try {
            this.pool[dbPath].db.close();
        } catch (error) {
            console.error(`Error closing connection for ${dbPath}:`, error);
        } finally {
            delete this.pool[dbPath];
        }
    }

    closeAll(): void {
        Object.keys(this.pool).forEach(dbPath => {
            this.closeConnection(dbPath);
        });
    }

    onModuleDestroy() {
        this.closeAll();
    }
}