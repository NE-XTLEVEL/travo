import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsString, Max, MinLength } from "class-validator";

export class RecommendationDto {
  @ApiProperty({
    description: "The description of the recommendation",
    example: "산뜻한 여행을 가고 싶어요",
  })
  @IsString({ message: "description must be a string" })
  @MinLength(1, { message: "description must be at least 1 character long" })
  description: string;

  @ApiProperty({
    description: "The date of the recommendation",
    example: "2023-10-01",
  })
  @Type(() => Date)
  @IsDate({ message: "date must be a valid date" })
  date: Date;

  @ApiProperty({
    description: "The number of days for the recommendation",
    example: 3,
  })
  @Max(10, { message: "days must be at most 7" })
  days: number;

  @ApiProperty({
    description: "The name of this plan",
    example: "2박 3일 여행계획",
  })
  @IsString({ message: "name must be a string" })
  plan_name: string;
}
