import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("migrations_history", { schema: "tc_data" })
export class MigrationsHistory {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("bigint", { name: "timestamp" })
  timestamp: string;

  @Column("varchar", { name: "name", length: 255 })
  name: string;
}
