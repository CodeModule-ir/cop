import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./User";
import { GroupSettings } from "./GroupSettings";

@Entity()
export class Warning {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.warnings)
  user!: User;

  @ManyToOne(() => GroupSettings, (group) => group.warnings)
  group!: GroupSettings;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  warned_at!: Date;

  @Column({ type: "text", nullable: true })
  reason!: string;
}
