import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { ApprovedUser } from "./ApprovedUser";
import { ChatPermissions } from "grammy/types";
import { Warning } from "./Warning";

@Entity()
export class GroupSettings {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true, type: "bigint" })
  group_id!: number;

  @Column()
  group_name!: string;

  @Column({ type: "text", nullable: true })
  rules!: string;

  @Column({ type: "bigint", nullable: true })
  added_by_id!: number;

  @Column({ type: "simple-array", nullable: true })
  black_list!: string[];

  @Column({ type: "json", nullable: true })
  chat_permissions!: ChatPermissions;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  updated_at!: Date;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at!: Date;

  @OneToMany(() => ApprovedUser, (approvedUser) => approvedUser.group, {
    cascade: true,
    onDelete: "CASCADE",
    eager: true,
  })
  approvedUsers!: ApprovedUser[];

  @OneToMany(() => Warning, (warning) => warning.group, {
    cascade: true,
    onDelete: "CASCADE",
  })
  warnings!: Warning[];

  @Column({ type: "boolean" })
  isSpamTime: boolean = false;

  @Column({ type: "simple-array", nullable: true })
  members!: string[];
}
