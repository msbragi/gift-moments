import { MigrationInterface, QueryRunner } from "typeorm";

export class ConvertToSnakeCase1745387532520 implements MigrationInterface {
    name = 'ConvertToSnakeCase1745387532520'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // First drop foreign keys to avoid constraints issues
        await queryRunner.query(`ALTER TABLE \`recipients\` DROP FOREIGN KEY IF EXISTS \`FK_dd01703292dd2c63782ff0d628b\``);
        await queryRunner.query(`ALTER TABLE \`capsules\` DROP FOREIGN KEY IF EXISTS \`FK_09cad7822e6c78baa7994a64f1e\``);
        await queryRunner.query(`ALTER TABLE \`items\` DROP FOREIGN KEY IF EXISTS \`FK_d2bb666cb315150435e38ee0462\``);
        
        // Recipients table
//        await queryRunner.query(`ALTER TABLE \`recipients\` CHANGE \`capsuleId\` \`capsule_id\` int NOT NULL`);
//        await queryRunner.query(`ALTER TABLE \`recipients\` CHANGE \`userId\` \`user_id\` int NULL`);
        
        // Capsules table
//        await queryRunner.query(`ALTER TABLE \`capsules\` CHANGE \`userId\` \`user_id\` int NOT NULL`);
//        await queryRunner.query(`ALTER TABLE \`capsules\` CHANGE \`openDate\` \`open_date\` datetime NOT NULL`);
//        await queryRunner.query(`ALTER TABLE \`capsules\` CHANGE \`isOpen\` \`is_open\` tinyint NOT NULL DEFAULT 0`);
//        await queryRunner.query(`ALTER TABLE \`capsules\` CHANGE \`isPhisical\` \`is_physical\` tinyint NULL`);
        
        // Users table
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`fullName\` \`full_name\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`isFromGoogle\` \`is_from_google\` tinyint NOT NULL DEFAULT 0`);
        
        // Recreate foreign keys with new column names
        await queryRunner.query(`ALTER TABLE \`items\` ADD CONSTRAINT \`FK_d2bb666cb315150435e38ee0462\` FOREIGN KEY (\`capsule_id\`) REFERENCES \`capsules\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`recipients\` ADD CONSTRAINT \`FK_dd01703292dd2c63782ff0d628b\` FOREIGN KEY (\`capsule_id\`) REFERENCES \`capsules\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`capsules\` ADD CONSTRAINT \`FK_09cad7822e6c78baa7994a64f1e\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign keys
        await queryRunner.query(`ALTER TABLE \`capsules\` DROP FOREIGN KEY \`FK_09cad7822e6c78baa7994a64f1e\``);
        await queryRunner.query(`ALTER TABLE \`recipients\` DROP FOREIGN KEY \`FK_dd01703292dd2c63782ff0d628b\``);
        await queryRunner.query(`ALTER TABLE \`items\` DROP FOREIGN KEY \`FK_d2bb666cb315150435e38ee0462\``);
        
        // Users table
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`last_name\` \`lastName\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`first_name\` \`firstName\` varchar(255) NULL`);
        
        // Capsules table
        await queryRunner.query(`ALTER TABLE \`capsules\` CHANGE \`is_physical\` \`isPhisical\` tinyint NULL`);
        await queryRunner.query(`ALTER TABLE \`capsules\` CHANGE \`is_open\` \`isOpen\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`capsules\` CHANGE \`open_date\` \`openDate\` datetime NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`capsules\` CHANGE \`user_id\` \`userId\` int NOT NULL`);
        
        // Recipients table
        await queryRunner.query(`ALTER TABLE \`recipients\` CHANGE \`user_id\` \`userId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`recipients\` CHANGE \`capsule_id\` \`capsuleId\` int NOT NULL`);
        
        
        // Recreate foreign keys with original column names
        await queryRunner.query(`ALTER TABLE \`items\` ADD CONSTRAINT \`FK_d2bb666cb315150435e38ee0462\` FOREIGN KEY (\`capsuleId\`) REFERENCES \`capsules\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`recipients\` ADD CONSTRAINT \`FK_dd01703292dd2c63782ff0d628b\` FOREIGN KEY (\`capsuleId\`) REFERENCES \`capsules\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`capsules\` ADD CONSTRAINT \`FK_09cad7822e6c78baa7994a64f1e\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
}