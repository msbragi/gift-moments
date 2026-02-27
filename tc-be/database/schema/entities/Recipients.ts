import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Capsules } from "./Capsules";

@Index("FK_dd01703292dd2c63782ff0d628b", ["capsuleId"], {})
@Entity("recipients", { schema: "tc_data" })
export class Recipients {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", { name: "capsule_id" })
  capsuleId: number;

  @Column("int", { name: "user_id", nullable: true })
  userId: number | null;

  @Column("varchar", { name: "email", length: 255 })
  email: string;

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

  @ManyToOne(() => Capsules, (capsules) => capsules.recipients, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "capsule_id", referencedColumnName: "id" }])
  capsule: Capsules;
}
