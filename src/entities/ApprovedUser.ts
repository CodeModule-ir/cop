import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { GroupSettings } from "./GroupSettings";

@Entity()
export class ApprovedUser {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "bigint" })
  user_id!: number;

  @Column({ type: "varchar", length: 255, nullable: true })
  username!: string;

  @ManyToOne(
    () => GroupSettings,
    (groupSettings) => groupSettings.approvedUsers,
    {
      onDelete: "CASCADE",
    }
  )
  group!: GroupSettings;
}
