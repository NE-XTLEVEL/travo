import { Module } from "@nestjs/common";
import { PlanService } from "./plan.service";
import { PlanController } from "./plan.controller";
import { Plan } from "./entities/plan.entity";
import { Event } from "./entities/event.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PlanRepository } from "./plan.repository";

@Module({
  imports: [TypeOrmModule.forFeature([Plan, Event])],
  controllers: [PlanController],
  providers: [PlanService, PlanRepository],
  exports: [PlanService],
})
export class PlanModule {}
