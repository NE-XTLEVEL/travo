import { Injectable } from "@nestjs/common";
import { DataSource, QueryRunner, Repository } from "typeorm";
import { Plan } from "./entities/plan.entity";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class PlanRepository extends Repository<Plan> {
  constructor(
    @InjectRepository(Plan)
    private readonly repository: Repository<Plan>,
    private readonly dataSource: DataSource,
  ) {
    super(repository.target, repository.manager);
  }

  async getPlans(user_id: number, cursor: number): Promise<Plan[]> {
    const query_builder = this.repository
      .createQueryBuilder("plan")
      .leftJoin("plan.user", "user")
      .where("user.id = :user_id", { user_id });

    if (cursor) {
      query_builder.andWhere("plan.id < :cursor", { cursor });
    }

    return query_builder.orderBy("plan.id", "DESC").take(25).getMany();
  }

  /**
   * embedding_vector에 맞는 장소 추천
   * @param {number[]} embedding_vector 사용자가 입력한 문장의 임베딩 벡터
   * @param {number} take 추천할 장소 개수
   * @returns 추천 랜드마크 리스트
   * */
  async getPlan(
    user_id: number,
    plan_id: number,
    queryRunner?: QueryRunner,
  ): Promise<Plan> {
    if (queryRunner) {
      return queryRunner.manager
        .createQueryBuilder(Plan, "plan")
        .select([
          "plan.id",
          "plan.name",
          "event.day",
          "event.local_id",
          "location.id",
          "location.name",
          "location.address",
          "location.url",
          "location.coordinates",
          "location.review_score",
          "category.name",
        ])
        .leftJoin("plan.events", "event")
        .leftJoin("event.location", "location")
        .leftJoin("plan.user", "user")
        .leftJoin("location.category", "category")
        .where("user.id = :user_id", { user_id })
        .andWhere("plan.id = :plan_id", { plan_id })
        .orderBy("event.local_id", "ASC")
        .getOne();
    }
    return this.repository
      .createQueryBuilder("plan")
      .select([
        "plan.id",
        "plan.name",
        "event.day",
        "event.local_id",
        "location.id",
        "location.name",
        "location.address",
        "location.url",
        "location.coordinates",
        "location.review_score",
        "category.name",
      ])
      .leftJoin("plan.events", "event")
      .leftJoin("event.location", "location")
      .leftJoin("plan.user", "user")
      .leftJoin("location.category", "category")
      .where("user.id = :user_id", { user_id })
      .andWhere("plan.id = :plan_id", { plan_id })
      .orderBy("event.local_id", "ASC")
      .getOne();
  }
}
