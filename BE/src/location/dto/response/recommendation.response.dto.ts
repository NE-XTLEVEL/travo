import { ApiExtraModels, ApiProperty, getSchemaPath } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ValidateNested } from "class-validator";
import { LocationResponseDto } from "./location.response.dto";
import { Event } from "src/plan/entities/event.entity";
import { categoryToNumberMap } from "src/common/category/category";

@ApiExtraModels(LocationResponseDto)
export class RecommendationResponseDto {
  @ApiProperty({
    type: "object",
    additionalProperties: {
      type: "array",
      items: { $ref: getSchemaPath(LocationResponseDto) },
    },
    example: {
      day1: [
        {
          kakao_id: 12156,
          local_id: 1,
          name: "인천공항",
          x: 126.442056,
          y: 37.458848,
          address: "인천광역시 중구 공항로 272",
          url: "https://naver.com",
          category: "교통",
        },
      ],
      day2: [
        {
          kakao_id: 85765,
          local_id: 16,
          name: "어린이 대공원",
          x: 127.081761,
          y: 37.549567,
          address: "버섯마을,서울특별시 광진구 능동 18",
          url: "",
          category: "명소",
        },
      ],
    },
  })
  @ValidateNested({ each: true })
  @Type(() => LocationResponseDto)
  data: Record<string, LocationResponseDto[]>;

  @ApiProperty({
    description: "The max number of local_id",
    example: 16,
  })
  max_id: number;

  @ApiProperty({
    description: "The plan id",
    example: 1,
  })
  plan_id: number;

  @ApiProperty({
    description: "The name of the plan",
    example: "여행 계획",
  })
  plan_name: string;

  static of(
    events: Event[],
    max_id: number,
    plan_id: number,
    plan_name: string,
  ): RecommendationResponseDto {
    const recommendationResponseDto = new RecommendationResponseDto();
    recommendationResponseDto.data = {};
    recommendationResponseDto.max_id = max_id;
    recommendationResponseDto.plan_id = plan_id;
    recommendationResponseDto.plan_name = plan_name;
    let is_lunch = false;
    for (const event of events) {
      const dayKey = `day${event.day}`;
      if (!recommendationResponseDto.data[dayKey]) {
        recommendationResponseDto.data[dayKey] = [];
        is_lunch = true;
      }
      if (categoryToNumberMap.get(event.location.category.name) > 2) {
        event.location.url = `https://place.map.kakao.com/${event.location.id}`;
      }
      recommendationResponseDto.data[dayKey].push({
        kakao_id: event.location.id,
        local_id: event.local_id,
        name: event.location.name,
        x: event.location.coordinates.coordinates[0],
        y: event.location.coordinates.coordinates[1],
        address: event.location.address,
        url: event.location.url,
        category: event.location.category.name,
        is_lunch: is_lunch,
      });
      is_lunch = false;
    }

    return recommendationResponseDto;
  }
}
