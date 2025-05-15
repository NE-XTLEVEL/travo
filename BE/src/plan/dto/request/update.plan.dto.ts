import { ApiProperty, getSchemaPath } from "@nestjs/swagger";
import { IsObject, Validate } from "class-validator";
import { LocationDataValidator } from "src/common/validator/location.validator";
import { LocationDto } from "src/location/dto/request/location.dto";

export class UpdatePlanDto {
  @ApiProperty({
    type: "object",
    additionalProperties: {
      type: "array",
      items: { $ref: getSchemaPath(LocationDto) },
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
          category: "공공기관",
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
          category: "관광명소",
        },
      ],
    },
  })
  @IsObject({ message: "data must be an object" })
  @Validate(LocationDataValidator)
  data: Record<string, LocationDto[]>;
}
