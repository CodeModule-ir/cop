import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Warning } from "./Warning";
import { Mute } from "./Mute";
// import { Ban } from "./Ban";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "bigint", unique: true })
  telegram_id!: number;

  @Column()
  username!: string;

  @Column()
  first_name!: string;

  @Column({ default: "member" })
  role!: string;

  @OneToMany(() => Warning, (warning) => warning.user)
  warnings!: Warning[];

  @OneToMany(() => Mute, (mute) => mute.user)
  mutes!: Mute[];
  
}
