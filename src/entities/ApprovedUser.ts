import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { GroupSettings } from "./GroupSettings";
import { User } from "./User";

@Entity()
export class ApprovedUser {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "bigint" })
  user_id!: number;

  @Column({ type: "varchar", length: 255, nullable: true })
  username!: string;

  @ManyToOne(() => GroupSettings, (groupSettings) => groupSettings.approvedUsers, {
    onDelete: "CASCADE",
  })
  group!: GroupSettings;

  @ManyToOne(() => User, (user) => user.approvedUsers, {
    onDelete: "CASCADE",
  })
  user!: User;
}
