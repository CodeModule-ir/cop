import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Warning } from "./Warning";
import { ApprovedUser } from "./ApprovedUser";
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "bigint", unique: true })
  telegram_id!: number;

  @Column({ type: "varchar", length: 255, nullable: true })
  username!: string;

  @Column({ type: "enum", enum: ["member", "admin", "owner", "restricted", "approved"], default: "member" })
  role!: string;

  @OneToMany(() => Warning, (warning) => warning.user, { cascade: true, onDelete: "CASCADE" })
  warnings!: Warning[];

  @OneToMany(() => ApprovedUser, (approvedUser) => approvedUser.user, { cascade: true, onDelete: "CASCADE" })
  approvedUsers!: ApprovedUser[];
}