import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Capsules } from "./Capsules";

@Index("IDX_97672ac88f789774dd47f7c8be", ["email"], { unique: true })
@Entity("users", { schema: "tc_data" })
export class Users {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "email", unique: true, length: 255 })
  email: string;

  @Column("varchar", { name: "password", length: 255 })
  password: string;

  @Column("tinyint", { name: "is_from_google", default: () => "'0'" })
  isFromGoogle: number;

  @Column("varchar", { name: "full_name", nullable: true, length: 255 })
  fullName: string | null;

  @Column("varchar", { name: "avatar", nullable: true, length: 255 })
  avatar: string | null;

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

  @OneToMany(() => Capsules, (capsules) => capsules.user)
  capsules: Capsules[];
}
