import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Plan } from "src/plan/entities/plan.entity";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn({ name: "id", type: "int" })
  id: number;

  @Column({ name: "name", type: "varchar", length: 50, nullable: false })
  name: string;

  @Column({
    name: "email",
    type: "varchar",
    length: 50,
    nullable: false,
    unique: true,
  })
  email: string;

  @Column({ name: "password", type: "varchar", length: 255, nullable: false })
  password: string;

  @Column({
    name: "refresh_token",
    type: "varchar",
    length: 255,
    nullable: true,
  })
  refresh_token: string;

  @OneToMany(() => Plan, (plan) => plan.user)
  plans: Plan[];
}
