import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Users } from "./Users";
import { Items } from "./Items";
import { Recipients } from "./Recipients";

@Index("FK_09cad7822e6c78baa7994a64f1e", ["userId"], {})
@Entity("capsules", { schema: "tc_data" })
export class Capsules {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", { name: "user_id" })
  userId: number;

  @Column("varchar", { name: "name", length: 255 })
  name: string;

  @Column("varchar", { name: "description", length: 255 })
  description: string;

  @Column("datetime", { name: "open_date" })
  openDate: Date;

  @Column("tinyint", { name: "is_public", default: () => "'0'" })
  isPublic: number;

  @Column("tinyint", { name: "is_open", default: () => "'0'" })
  isOpen: number;

  @Column("tinyint", { name: "is_physical", default: () => "'0'" })
  isPhysical: number;

  @Column("varchar", { name: "lat", nullable: true, length: 255 })
  lat: string | null;

  @Column("varchar", { name: "lng", nullable: true, length: 255 })
  lng: string | null;

  @Column("datetime", {
    name: "created",
    default: () => "'CURRENT_TIMESTAMP(6)'",
  })
  created: Date;

  @Column("datetime", {
    name: "updated",
    default: () => "'CURRENT_TIMESTAMP(6)'",
  })
  updated: Date;

  @Column("datetime", { name: "deleted" })
  deleted: Date;

  @ManyToOne(() => Users, (users) => users.capsules, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: Users;

  @OneToMany(() => Items, (items) => items.capsule)
  items: Items[];

  @OneToMany(() => Recipients, (recipients) => recipients.capsule)
  recipients: Recipients[];
}
