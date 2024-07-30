import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class GroupSettings {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  group_id!: number;

  @Column()
  group_name!: string;

  @Column({ type: "text", nullable: true })
  welcome_message!: string;

  @Column({ type: "text", nullable: true })
  rules!: string;

  @Column({ type: "text", nullable: true })
  description!: string;

  @Column({ type: "boolean", default: true })
  moderation_enabled!: boolean;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  updated_at!: Date;
}
