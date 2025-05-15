import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Category } from "./entities/category.entity";
import { categoryToNumberMap } from "src/common/category/category";
import { Location } from "./entities/location.entity";
import { LocationHour } from "./entities/location_hour.entity";

@Injectable()
export class LocationRepository extends Repository<Location> {
  constructor(
    @InjectRepository(Location)
    private readonly repository: Repository<Location>,
    private readonly dataSource: DataSource,
  ) {
    super(repository.target, repository.manager);
  }

  /**
   * landmarks 조회
   * @param {number[]} landmark_ids 랜드마크 id 리스트
   * @returns 랜드마크 리스트
   */
  async getLandmarks(landmark_ids: number[]) {
    return this.repository
      .createQueryBuilder("location")
      .leftJoinAndSelect("location.category", "category")
      .select([
        "location.id AS kakao_id",
        "location.name AS name",
        "location.address AS address",
        "location.url AS url",
        "ST_X(location.coordinates) AS x",
        "ST_Y(location.coordinates) AS y",
        "category.name AS category",
      ])
      .where("location.id IN (:...landmark_ids)", { landmark_ids })
      .orderBy(
        `array_position(ARRAY[${landmark_ids.join(",")}]::int[], location.id)`,
      )
      .getRawMany();
  }

  /**
   * embedding_vector에 맞는 장소 추천
   * @param {string} embedding_vector 사용자가 입력한 문장의 임베딩 벡터
   * @param {number} take 추천할 장소 개수
   * @returns 추천 랜드마크 리스트
   * */
  async recommendLandmark(embedding_vector: string, take: number) {
    return this.repository
      .createQueryBuilder("location")
      .leftJoinAndSelect("location.category", "category")
      .select([
        "location.id AS kakao_id",
        "location.name AS name",
        "location.address AS address",
        "location.url AS url",
        "ST_X(location.coordinates) AS x",
        "ST_Y(location.coordinates) AS y",
        "category.name AS category",
      ])
      .addSelect(`location.review_vector <-> :embedding`, "distance")
      .setParameter("embedding", embedding_vector)
      .where("location.is_hotspot = true")
      .orderBy("distance", "ASC")
      .limit(take)
      .getRawMany();
  }

  /**
   * embedding_vector에 맞는 장소 추천
   * @param {string} embedding_vector 사용자가 입력한 문장의 임베딩 벡터
   * @param {number} min_x 추천 가능한 최소 x 좌표
   * @param {number} max_x 추천 가능한 최대 x 좌표
   * @param {number} min_y 추천 가능한 최소 y 좌표
   * @param {number} max_y 추천 가능한 최대 y 좌표
   * @param {number} landmark_id 사용자가 선택한 랜드마크 id
   * @param {number} day 사용자가 선택한 랜드마크의 추천 요일
   * @returns 추천 장소 리스트
   * */
  async recommendOtherCategory(
    embedding_vector: string,
    min_x: number,
    max_x: number,
    min_y: number,
    max_y: number,
    landmark_id: number,
    day: number,
  ) {
    const filtering_query = this.dataSource
      .createQueryBuilder()
      .subQuery()
      .select([
        "location.id AS id",
        "location.name AS name",
        "location.address AS address",
        "location.url AS url",
        "location.coordinates AS coordinates",
        "location.review_score AS review_score",
        "location.review_vector AS review_vector",
        "category.id AS category_id",
        "category.name AS category_name",
        "hours.open_time < TIME '12:30:00' AND hours.close_time > TIME '13:00:00' AND day = :day AS lunch",
        "hours.open_time < TIME '18:30:00' AND hours.close_time > TIME '19:00:00' AND day = :day AS dinner",
      ])
      .from("locations", "location")
      .where("ST_X(location.coordinates) BETWEEN :x_min AND :x_max")
      .andWhere("ST_Y(location.coordinates) BETWEEN :y_min AND :y_max")
      .andWhere("location.id != :landmark_id")
      .andWhere(
        "(location.review_score IS NULL OR location.review_score >= 3.0)",
      )
      .andWhere("location.review_vector IS NOT NULL")
      .leftJoin(Category, "category", "location.category_id = category.id")
      .leftJoin(LocationHour, "hours", "location.id = hours.location_id")
      .getQuery();

    const sub_query = this.dataSource
      .createQueryBuilder()
      .subQuery()
      .select([
        "fq.id AS id",
        "fq.name AS name",
        "fq.address AS address",
        "fq.url AS url",
        "fq.coordinates AS coordinates",
        "fq.review_score AS review_score",
        "fq.category_id AS category_id",
        "fq.category_name AS category_name",
        `CASE
          WHEN (fq.category_id = 1 AND fq.lunch) THEN 0
          WHEN (fq.category_id = 1 AND fq.dinner) THEN 3
          WHEN fq.category_id = 2 THEN 1
          WHEN fq.category_id > 3 AND fq.category_id < 6 THEN 2
          ELSE 4
        END AS order_category`,
      ])
      .addSelect(
        `ROW_NUMBER() OVER (
          PARTITION BY 
            CASE
              WHEN (fq.category_id = 1 AND fq.lunch) THEN '점심'
              WHEN (fq.category_id = 1 AND fq.dinner) THEN '저녁'
              WHEN fq.category_id = 2 THEN '카페'
              WHEN fq.category_id > 3 AND fq.category_id < 6 THEN '관광 명소'
              ELSE '기타'
            END
          ORDER BY fq.review_vector <-> :embedding
        ) AS rn`,
      )
      .from(`(${filtering_query})`, "fq")
      .getQuery();

    return this.dataSource
      .createQueryBuilder()
      .select([
        "sq.id AS kakao_id",
        "sq.name",
        "sq.address",
        "sq.url",
        "ST_X(sq.coordinates) AS x",
        "ST_Y(sq.coordinates) AS y",
        "sq.category_name AS category",
      ])
      .from(`(${sub_query})`, "sq")
      .setParameter("x_min", min_x)
      .setParameter("x_max", max_x)
      .setParameter("y_min", min_y)
      .setParameter("y_max", max_y)
      .setParameter("landmark_id", landmark_id)
      .setParameter("embedding", embedding_vector)
      .setParameter("day", day)
      .where("sq.rn = 1")
      .andWhere("sq.order_category < 4")
      .orderBy("sq.order_category", "ASC")
      .getRawMany();
  }

  /**
   * embedding_vector에 맞는 숙소 추천
   * @param {string} embedding_vector 사용자가 입력한 문장의 임베딩 벡터
   * @param {number} x 사용자가 원하는 x 좌표
   * @param {number} y 사용자가 원하는 y 좌표
   * @returns 추천 숙소
   * */
  async recommendAccommodation(embedding_vector: string, x: number, y: number) {
    return this.repository
      .createQueryBuilder("location")
      .leftJoinAndSelect("location.category", "category")
      .select([
        "location.id AS kakao_id",
        "location.name AS name",
        "location.address AS address",
        "location.url AS url",
        "ST_X(location.coordinates) AS x",
        "ST_Y(location.coordinates) AS y",
        "category.name AS category",
      ])
      .where("category.id = :category_id", { category_id: 3 })
      .andWhere(
        `ST_DWithin(
          coordinates,
          ST_SetSRID(ST_MakePoint(:x, :y), 4326)::geography,
          2500
        )`,
        {
          x,
          y,
        },
      )
      .addSelect(`location.review_vector <-> :embedding`, "distance")
      .setParameter("embedding", embedding_vector)
      .orderBy("distance")
      .limit(1)
      .getRawOne();
  }

  /**
   * embedding_vector에 맞는 장소 추천
   * @param {number[]} embedding_vector 사용자가 입력한 문장의 임베딩 벡터
   * @param {string} category 사용자가 원하는 장소 카테고리
   * @param {number} day 사용자가 원하는 추천 요일
   * @param {boolean} is_lunch 사용자가 점심/저녁 중 무엇을 원하는지
   * @param {number} x 사용자가 원하는 x 좌표
   * @param {number} y 사용자가 원하는 y 좌표
   * @returns 추천 장소 리스트
   * */
  async recommendOne(
    original_id: number,
    embedding_vector: string,
    category: string,
    is_lunch: boolean,
    x: number,
    y: number,
    high_review: boolean,
  ) {
    const queryBuilder = this.repository
      .createQueryBuilder("location")
      .leftJoin("location.category", "category")
      .select([
        "location.id AS kakao_id",
        "location.name AS name",
        "location.address AS address",
        "location.url AS url",
        "ST_X(location.coordinates) AS x",
        "ST_Y(location.coordinates) AS y",
        "category.name AS category",
      ])
      .setParameter("embedding", embedding_vector)
      .where("category.name = :category", { category })
      .andWhere("location.review_vector IS NOT NULL")
      .andWhere(
        `ST_DWithin(
          coordinates,
          ST_SetSRID(ST_MakePoint(:x, :y), 4326)::geography,
          2500
        )`,
        {
          x,
          y,
        },
      )
      .andWhere("location.id != :original_id", { original_id })
      .addSelect(`location.review_vector <-> :embedding`, "distance");

    if (high_review) {
      queryBuilder.andWhere(
        "(location.review_score IS NULL OR location.review_score >= 3.5)",
      );
    }

    if (categoryToNumberMap.get(category) < 3) {
      queryBuilder.leftJoin("location.hours", "hours");
      if (is_lunch) {
        queryBuilder
          .andWhere("hours.open_time < TIME '12:30:00'")
          .andWhere("hours.close_time > TIME '13:00:00'");
      } else {
        queryBuilder
          .andWhere("hours.open_time < TIME '18:30:00'")
          .andWhere("hours.close_time > TIME '19:00:00'");
      }
    }
    return await queryBuilder
      .distinct(true)
      .orderBy("distance")
      .limit(3)
      .getRawMany();
  }
}
