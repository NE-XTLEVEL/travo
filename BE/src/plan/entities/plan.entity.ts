import { User } from "src/user/entities/user.entity";
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Event } from "./event.entity";

@Entity({ name: "plans" })
export class Plan {
  @PrimaryGeneratedColumn({ name: "id", type: "int" })
  id: number;

  @Column({
    name: "name",
    type: "varchar",
    length: 255,
    nullable: false,
  })
  name: string;

  @JoinColumn({ name: "user_id" })
  @ManyToOne(() => User, (user) => user.plans, {
    nullable: false,
  })
  user: User;

  @OneToMany(() => Event, (event) => event.plan, {
    nullable: false,
  })
  events: Event[];
}
