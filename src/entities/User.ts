import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "bigint", unique: true })
  telegram_id!: number;

  @Column()
  username!: string;

  @Column({ default: "member" })
  role!: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  joined_at!: Date;
}
