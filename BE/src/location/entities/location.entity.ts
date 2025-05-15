import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Point,
  PrimaryColumn,
} from "typeorm";
import { Category } from "./category.entity";
import { Event } from "src/plan/entities/event.entity";
import { LocationHour } from "./location_hour.entity";

@Entity({ name: "locations" })
export class Location {
  @PrimaryColumn({ name: "id", type: "int" })
  id: number;

  @Column({ name: "name", type: "varchar", length: 50, nullable: false })
  name: string;

  @Column({ name: "address", type: "varchar", length: 100, nullable: false })
  address: string;

  @Column({ name: "url", type: "varchar", length: 100, nullable: true })
  url: string;

  @Column({ name: "is_hotspot", type: "boolean", default: false })
  is_hotspot: boolean;

  @Column({
    type: "geometry",
    spatialFeatureType: "Point",
    srid: 4326,
    nullable: false,
  })
  @Index("location_coordinates_idx", { spatial: true })
  coordinates: Point;

  @Column({
    name: "review_score",
    type: "numeric",
    precision: 2,
    scale: 1,
    nullable: true,
  })
  review_score: number;

  @Column("vector")
  review_vector: number[];

  @ManyToOne(() => Category, (category) => category.locations, {
    nullable: false,
  })
  @JoinColumn({ name: "category_id" })
  category: Category;

  @OneToMany(() => Event, (event) => event.location, {
    nullable: false,
  })
  events: Event[];

  @OneToMany(() => LocationHour, (location_hour) => location_hour.location, {
    nullable: false,
  })
  hours: LocationHour[];
}
