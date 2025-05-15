import { Injectable } from "@nestjs/common";
import { LocationRepository } from "./location.repository";
import { RecommendationDto } from "./dto/request/recommendation.dto";
import { HttpService } from "@nestjs/axios";
import { catchError, firstValueFrom, map } from "rxjs";
import { AxiosError } from "axios";
import { RecommendationResponseDto } from "./dto/response/recommendation.response.dto";
import { User } from "src/user/entities/user.entity";
import { PlanService } from "src/plan/plan.service";
import { RecommendationOneDto } from "./dto/request/recommendation.one.dto";
import { LocationResponseDto } from "./dto/response/location.response.dto";
import { landmarkToIdMap } from "src/common/landmark/landmark";

/*
SELECT name FROM locations WHERE review_score IS NOT NULL AND review_score >= 3 ORDER BY review_vector <#>
*/
@Injectable()
export class LocationService {
  constructor(
    private readonly locationRepository: LocationRepository,
    private readonly httpService: HttpService,
    private readonly planService: PlanService,
  ) {}

  async getRecommendation(
    user: User,
    recommendationDto: RecommendationDto,
  ): Promise<RecommendationResponseDto> {
    const { description, date, days, plan_name } = recommendationDto;

    const embedding_vector: string = await this.getEmbeddingVector(description); // description을 embedding vector로 변환

    let landmarks;
    try {
      const landmarks_name = await this.getLandmarks(days, description); // 랜드마크 추천

      if (landmarks_name === undefined || landmarks_name.length < days) {
        throw new Error("No landmarks found");
      }
      const landmarks_id = landmarks_name.map((name) =>
        landmarkToIdMap.get(name),
      );
      landmarks = await this.locationRepository.getLandmarks(landmarks_id); // 랜드마크 id로 장소 정보 가져오기
    } catch {
      landmarks = await this.locationRepository.recommendLandmark(
        embedding_vector,
        days,
      );
    } // 랜드마크를 days개 추천
    const day = date.getDay();
    const result = { data: {}, max_id: 0, plan_id: null, plan_name: plan_name };
    let local_id = 1;
    let accommodation;

    for (let i = 0; i < days; i++) {
      const { min_x, max_x, min_y, max_y } = await this.getSector(
        landmarks[i].x,
        landmarks[i].y,
      ); // 랜드마크의 sector 구하기
      const response = await this.locationRepository.recommendOtherCategory(
        embedding_vector,
        min_x,
        max_x,
        min_y,
        max_y,
        landmarks[i].kakao_id,
        (day + i) % 7,
      );

      if (days == 2 && i == 0) {
        accommodation = await this.locationRepository.recommendAccommodation(
          embedding_vector,
          landmarks[i].x,
          landmarks[i].y,
        );
      } else if (i % 2 == 0 && i + 1 < days) {
        accommodation = await this.locationRepository.recommendAccommodation(
          embedding_vector,
          landmarks[i + 1].x,
          landmarks[i + 1].y,
        );
      }

      result.data[`day${i + 1}`] = [];

      for (let j = 0; j < 6; j++) {
        if (i == days - 1 && j == 5) {
          break;
        }
        if (j === 0) {
          result.data[`day${i + 1}`].push({
            ...response[j],
            is_lunch: true,
            local_id,
          });
        } else if (j === 1) {
          result.data[`day${i + 1}`].push({
            ...response[j],
            is_lunch: false,
            local_id,
          });
        } else if (j === 2) {
          result.data[`day${i + 1}`].push({
            ...response[j],
            is_lunch: false,
            local_id,
            url: `https://place.map.kakao.com/${response[j].kakao_id}`,
          });
        } else if (j === 3) {
          result.data[`day${i + 1}`].push({
            ...landmarks[i],
            is_lunch: false,
            local_id,
            url: `https://place.map.kakao.com/${landmarks[i].kakao_id}`,
          });
        } else if (j === 4) {
          result.data[`day${i + 1}`].push({
            ...response[j - 1],
            is_lunch: false,
            local_id,
          });
        } else if (j === 5) {
          result.data[`day${i + 1}`].push({
            ...accommodation,
            is_lunch: false,
            local_id,
            url: `https://place.map.kakao.com/${accommodation.kakao_id}`,
          });
        }
        local_id++;
      }
    }

    result.max_id = local_id - 1;

    if (user) {
      const plan = await this.planService.createPlan(
        user.id,
        result,
        plan_name,
      ); // 계획 저장
      result.plan_id = plan.id;
    }
    return result;
  }

  async getRecommendationOne(
    recommendationOneDto: RecommendationOneDto,
  ): Promise<LocationResponseDto[]> {
    const {
      original_id,
      description,
      category,
      is_lunch,
      x,
      y,
      high_review,
      local_id,
    } = recommendationOneDto;

    const embedding_vector = await this.getEmbeddingVector(description); // description을 embedding vector로 변환

    const locations = await this.locationRepository.recommendOne(
      original_id,
      embedding_vector,
      category,
      is_lunch,
      x,
      y,
      high_review,
    ); // 장소 추천

    return locations.map((location) =>
      LocationResponseDto.of(
        {
          ...location,
          local_id,
        },
        is_lunch,
      ),
    );
  }

  private async getEmbeddingVector(description: string): Promise<string> {
    const response = await this.httpService
      .post(
        process.env.AI_SERVER + "/embedding",
        { prompt: description },
        {
          headers: {
            "Content-Type": "application/json" /* eslint-disable-line */,
            accept: "application/json",
          },
        },
      )
      .pipe(
        map((response) => response.data.embedding as number[]),
        catchError((error: AxiosError) => {
          throw new Error("Failed to fetch embedding from AI server " + error);
        }),
      );

    const embedding_vector = await firstValueFrom(response);

    const embedding_string = `[${embedding_vector.join(",")}]`;
    return embedding_string;
  }

  private async getLandmarks(days: number, prompt: string): Promise<string[]> {
    const response = await this.httpService
      .post(
        process.env.AI_SERVER + "/landmark",
        { prompt, days },
        {
          headers: {
            "Content-Type": "application/json" /* eslint-disable-line */,
            accept: "application/json",
          },
        },
      )
      .pipe(
        map((response) => response.data.landmarks as string[]),
        catchError((error: AxiosError) => {
          throw new Error("Failed to fetch landmark from AI server " + error);
        }),
      );

    const landmarks = await firstValueFrom(response);

    return landmarks;
  }

  private async getSector(x: number, y: number) {
    const south = 37.42764;
    const west = 126.769815;
    const lng_interval = 0.0417013;
    const lat_interval = 0.03066456;

    const min_x = Math.floor((x - west) / lng_interval) * lng_interval + west;
    const max_x =
      (Math.floor((x - west) / lng_interval) + 1) * lng_interval + west;
    const min_y = Math.floor((y - south) / lat_interval) * lat_interval + south;
    const max_y =
      (Math.floor((y - south) / lat_interval) + 1) * lat_interval + south;

    const sector = {
      min_x,
      max_x,
      min_y,
      max_y,
    };
    return sector;
  }
}
