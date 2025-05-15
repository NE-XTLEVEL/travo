import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsIn, IsNumber, IsString } from "class-validator";
import { validRecommendationCategories } from "src/common/category/category";

export class RecommendationOneDto {
  @ApiProperty({
    description: "The original id of the location",
    example: "12345678",
  })
  @IsNumber({}, { message: "original_id must be a number" })
  original_id: number;

  @ApiProperty({
    description: "The description of the recommendation",
    example: "산뜻한 여행을 가고 싶어요",
  })
  description: string;

  @ApiProperty({
    description: "The category for the recommendation",
    example: "음식점",
  })
  @IsString({ message: "category must be a string" })
  @IsIn(validRecommendationCategories, {
    message: (args) =>
      `${args.value}는 유효한 카테고리가 아닙니다. 유효한 카테고리: ${validRecommendationCategories.join(", ")}`,
  })
  category: string;

  @ApiProperty({
    description: "Is Lunch or Dinner",
    example: true,
  })
  @IsBoolean({ message: "is_lunch must be a boolean" })
  is_lunch: boolean;

  @ApiProperty({
    description: "The x coordinate of the location",
    example: 127.005262,
  })
  x: number;

  @ApiProperty({
    description: "The y coordinate of the location",
    example: 37.556048,
  })
  y: number;

  @ApiProperty({
    description: "Do you want high review?",
    example: true,
  })
  @IsBoolean({ message: "high_review must be a boolean" })
  high_review: boolean;

  @ApiProperty({
    description: "The local id of the recommendation",
    example: 1,
  })
  @IsNumber({}, { message: "local_id must be a number" })
  local_id: number;
}
