import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsNumber, IsString, MinLength } from "class-validator";
import { categoryToNumberMap } from "src/common/category/category";

export class LocationDto {
  @ApiProperty({
    description: "The Kakao ID of the recommendation",
    example: "12345678",
  })
  @IsNumber({}, { message: "kakao_id must be a number" })
  kakao_id: number;

  @ApiProperty({
    description: "The Local ID of the recommendation",
    example: "1",
  })
  @IsNumber({}, { message: "local_id must be a number" })
  local_id: number;

  @ApiProperty({
    description: "The name of the locationn",
    example:
      "호우섬 더현대서울점이라고 하고 난몰라 난몰라 천번만번 알아줘도 몰라몰라",
  })
  @IsString({ message: "name must be a string" })
  @MinLength(1, { message: "name must be at least 1 character long" })
  name: string;

  @ApiProperty({
    description: "The x coordinate of the location",
    example: 127.005262,
  })
  @IsNumber({}, { message: "x must be a number" })
  x: number;

  @ApiProperty({
    description: "The y coordinate of the location",
    example: 37.556048,
  })
  @IsNumber({}, { message: "y must be a number" })
  y: number;

  @ApiProperty({
    description: "The address of the location",
    example: "서울특별시 중구 장충동 동호로 249 서울신라호텔 2층",
  })
  @IsString({ message: "address must be a string" })
  address: string;

  @ApiProperty({
    description: "The URL of the location",
    example: "https://booking.com",
  })
  url: string | null;

  @ApiProperty({
    description: "The category of the location",
    example: "식당",
  })
  @IsIn(Array.from(categoryToNumberMap.keys()), {
    message: "category must be one of the predefined categories",
  })
  category: string;
}
