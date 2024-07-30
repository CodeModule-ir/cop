import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Warning {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "bigint" })
  user_id!: number;

  @Column()
  username!: string;

  @Column({ default: 1 })
  warning_count!: number;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  last_warned_at!: Date;
}