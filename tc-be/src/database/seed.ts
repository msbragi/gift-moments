import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { config } from './ormconfig';

async function seed() {
    const dataSource = new DataSource(config);
    
    try {
        await dataSource.initialize();
        console.log('Connected to database');

        // Read and execute SQL files
        const seedsPath = path.join(__dirname, 'seeds');
        const seedFiles = ['users.sql', 'capsules.sql', 'items.sql', 'recipients.sql'];
        
        for (const file of seedFiles) {
            console.log(`Seeding ${file}...`);
            const sql = fs.readFileSync(path.join(seedsPath, file), 'utf8');
            await dataSource.query(sql);
            console.log(`${file} seeded successfully`);
        }
        
        console.log('Database seeded successfully!');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        if (dataSource.isInitialized) {
            await dataSource.destroy();
        }
    }
}

seed().catch(error => {
    console.error('Seed script failed:', error);
    process.exit(1);
});