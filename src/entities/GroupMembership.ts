import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from "typeorm";
import { GroupSettings } from "./GroupSettings";
import { User } from "./User";

@Entity()
export class GroupMembership {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => GroupSettings, (group) => group.members)
  group!: GroupSettings;

  @ManyToOne(() => User, (user) => user.memberships)
  user!: User;

  @Column({ default: false })
  is_admin!: boolean;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  joined_at!: Date;
}
