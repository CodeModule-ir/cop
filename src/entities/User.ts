import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Index } from "typeorm";
import { Warning } from "./Warning";
import { GroupMembership } from "./GroupMembership";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "bigint", unique: true })
  telegram_id!: number;

  @Column({ type: "enum", enum: ["member", "admin", "owner"], default: "member" })
  role!: string;

  @OneToMany(() => Warning, (warning) => warning.user, { cascade: true, onDelete: "CASCADE" })
  warnings!: Warning[];

  @OneToMany(() => GroupMembership, (membership) => membership.user, { cascade: true, onDelete: "CASCADE" })
  memberships!: GroupMembership[];
}
