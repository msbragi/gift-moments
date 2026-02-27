import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Capsules } from "./Capsules";

@Entity("items", { schema: "tc_data" })
export class Items {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", { name: "content_id" })
  contentId: number;

  @Column("varchar", { name: "name", length: 255 })
  name: string;

  @Column("int", { name: "size" })
  size: number;

  @Column("varchar", { name: "content_type", length: 255 })
  contentType: string;

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

  @Column("datetime", { name: "deleted", nullable: true })
  deleted: Date | null;

  @ManyToOne(() => Capsules, (capsules) => capsules.items, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "capsule_id", referencedColumnName: "id" }])
  capsule: Capsules;
}
