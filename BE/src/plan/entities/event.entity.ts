import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Plan } from "./plan.entity";
import { Location } from "src/location/entities/location.entity";

@Entity({ name: "events" })
export class Event {
  @PrimaryGeneratedColumn({ name: "id", type: "int" })
  id: number;

  @JoinColumn({ name: "plan_id" })
  @ManyToOne(() => Plan, (plan) => plan.events, {
    nullable: false,
  })
  plan: Plan;

  @JoinColumn({ name: "location_id" })
  @ManyToOne(() => Location, (location) => location.events, {
    nullable: false,
  })
  location: Location;

  @Column({ name: "day", type: "int", nullable: false })
  day: number;

  @Column({ name: "local_id", type: "int", nullable: false })
  local_id: number;
}
