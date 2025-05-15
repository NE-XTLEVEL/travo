import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { PlanRepository } from "./plan.repository";
import { RecommendationResponseDto } from "src/location/dto/response/recommendation.response.dto";
import { DataSource } from "typeorm";
import { Plan } from "./entities/plan.entity";
import { Event } from "./entities/event.entity";
import { PlanResponseDto } from "./dto/response/plan.response.dto";
import { UpdatePlanDto } from "./dto/request/update.plan.dto";
import { Location } from "src/location/entities/location.entity";
import { categoryToNumberMap } from "src/common/category/category";
import { UpdatePlanNameDto } from "./dto/request/update.plan_name.dto";

@Injectable()
export class PlanService {
  constructor(
    private readonly planRepository: PlanRepository,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 계획 저장
   * @param {number} user_id 사용자 id
   * @param {RecommendationResponseDto} recommendationResponseDto 추천 장소 리스트
   * @param {string} plan_name 계획 이름
   */
  async createPlan(
    user_id: number,
    recommendationResponseDto: RecommendationResponseDto,
    plan_name: string,
  ) {
    const { data } = recommendationResponseDto;

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const plan: Plan = await queryRunner.manager.save(Plan, {
        user: { id: user_id },
        name: plan_name,
      });
      for (let i = 1; i <= Object.keys(data).length; i++) {
        for (const location of data[`day${i}`]) {
          await queryRunner.manager.save(Event, {
            plan: { id: plan.id },
            location: { id: location.kakao_id },
            day: i,
            local_id: location.local_id,
          });
        }
      }

      await queryRunner.commitTransaction();
      return plan;
    } catch (error) {
      console.error("Error creating plan:", error);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException("Database error");
    } finally {
      await queryRunner.release();
    }
  }

  async getPlans(user_id: number, cursor: number): Promise<PlanResponseDto[]> {
    const result = await this.planRepository.getPlans(user_id, cursor);

    if (!result) {
      throw new NotFoundException("Plan not found");
    }

    return result.map((plan) => {
      return PlanResponseDto.of(plan);
    });
  }

  /**
   * 계획 조회
   * @param {number} user_id 사용자 id
   * @returns {Plan[]} 계획 리스트
   */
  async getPlan(
    user_id: number,
    plan_id: number,
  ): Promise<RecommendationResponseDto> {
    const result = await this.planRepository.getPlan(user_id, plan_id);

    if (!result) {
      throw new NotFoundException("Plan not found");
    }

    const max_id = result.events.reduce((max, event) => {
      return Math.max(max, event.local_id);
    }, 0);

    return RecommendationResponseDto.of(
      result.events,
      max_id,
      plan_id,
      result.name,
    );
  }

  /**
   * 계획 업데이트
   * @param {number} plan_id 계획 id
   * @param {number} user_id 사용자 id
   * @param {UpdatePlanDto} updatePlanDto 추천 장소 리스트
   */
  async updatePlan(
    plan_id: number,
    user_id: number,
    updatePlanDto: UpdatePlanDto,
  ) {
    const { data } = updatePlanDto;

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const plan: Plan = await this.planRepository.getPlan(
        user_id,
        plan_id,
        queryRunner,
      );

      const max_local_id = plan.events.length;
      let local_id = 1;

      for (const event of plan.events) {
        await queryRunner.manager.delete(Event, {
          plan: { id: plan.id },
          local_id: event.local_id,
        });
      }

      for (let i = 1; i <= Object.keys(data).length; i++) {
        for (const location of data[`day${i}`]) {
          if (location.local_id > max_local_id) {
            const exists = await this.dataSource
              .getRepository(Location)
              .exists({
                where: { id: location.kakao_id },
              });

            if (!exists) {
              await queryRunner.manager.save(Location, {
                id: location.kakao_id,
                name: location.name,
                coordinates: {
                  type: "Point",
                  coordinates: [location.x, location.y],
                },
                address: location.address,
                url: location.url,
                category: { id: categoryToNumberMap.get(location.category) },
              });
            }
          }
          await queryRunner.manager.save(Event, {
            plan: { id: plan.id },
            location: { id: location.kakao_id },
            day: i,
            local_id: local_id,
          });
          local_id++;
        }
      }

      await queryRunner.commitTransaction();

      return {
        message: "Plan updated successfully",
      };
    } catch (error) {
      console.error("Error updating plan:", error);
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException("Database error");
    } finally {
      await queryRunner.release();
    }
  }

  async updatePlanName(
    plan_id: number,
    user_id: number,
    updatePlanNameDto: UpdatePlanNameDto,
  ): Promise<{ message: string }> {
    const { name } = updatePlanNameDto;

    const plan: Plan = await this.planRepository.getPlan(user_id, plan_id);

    if (!plan) {
      throw new NotFoundException("Plan not found");
    }

    await this.planRepository.update({ id: plan_id }, { name });

    return {
      message: "Plan name updated successfully",
    };
  }
}
