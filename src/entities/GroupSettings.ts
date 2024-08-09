import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { GroupMembership } from "./GroupMembership";
import { ApprovedUser } from "./ApprovedUser";
import { ChatPermissions } from "grammy/types";

@Entity()
export class GroupSettings {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true, type: "bigint" })
  group_id!: number;

  @Column()
  group_name!: string;

  @Column({ type: "text", nullable: true })
  welcome_message!: string;

  @Column({ type: "text", nullable: true })
  rules!: string;

  @Column({ type: "text", nullable: true })
  description!: string;

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

  @OneToMany(() => GroupMembership, (membership) => membership.group, {
    cascade: true,
    onDelete: "CASCADE",
  })
  members!: GroupMembership[]

  @OneToMany(() => ApprovedUser, (approvedUser) => approvedUser.group, {
    cascade: true,
    onDelete: "CASCADE",
  })
  approvedUsers!: ApprovedUser[];
}