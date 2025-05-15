import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Location } from "./location.entity";

@Entity({ name: "location_hours" })
export class LocationHour {
  @PrimaryGeneratedColumn({ name: "id", type: "int" })
  id: number;

  @Column({ name: "day", type: "int", nullable: false })
  day: number;

  @Column({ name: "open_time", type: "time", nullable: false })
  open_time: string;

  @Column({ name: "close_time", type: "time", nullable: false })
  close_time: string;

  @ManyToOne(() => Location, (location) => location.hours, {
    nullable: false,
  })
  @JoinColumn({ name: "location_id" })
  location: Location;
}
