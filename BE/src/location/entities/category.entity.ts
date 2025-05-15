import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Location } from "./location.entity";

/*
INSERT INTO categories (name) VALUES
  ('음식점'),
  ('카페'),
  ('숙박'),
  ('관광명소'),
  ('문화시설'),
*/

@Entity({ name: "categories" })
export class Category {
  @PrimaryGeneratedColumn({ name: "id", type: "int" })
  id: number;

  @Column({ name: "name", type: "varchar", length: 50, nullable: false })
  name: string;

  @OneToMany(() => Location, (location) => location.category)
  locations: Location[];
}
