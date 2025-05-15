import { ApiProperty } from "@nestjs/swagger";
import { categoryToNumberMap } from "src/common/category/category";

export class LocationResponseDto {
  @ApiProperty({
    description: "The Kakao ID of the recommendation",
    example: "12345678",
  })
  kakao_id: number;

  @ApiProperty({
    description: "The Local ID of the recommendation",
    example: "1",
  })
  local_id: number;

  @ApiProperty({
    description: "The name of the locationn",
    example:
      "호우섬 더현대서울점이라고 하고 난몰라 난몰라 천번만번 알아줘도 몰라몰라",
  })
  name: string;

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
    description: "The address of the location",
    example: "서울특별시 중구 장충동 동호로 249 서울신라호텔 2층",
  })
  address: string;

  @ApiProperty({
    description: "The URL of the location",
    example: "https://booking.com",
  })
  url: string;

  @ApiProperty({
    description: "The category of the location",
    example: "식당",
  })
  category: string;

  @ApiProperty({
    description: "Is Lunch or Dinner",
    example: true,
  })
  is_lunch: boolean;

  static of(location: any, is_lunch: boolean): LocationResponseDto {
    const locationResponseDto = new LocationResponseDto();
    locationResponseDto.kakao_id = location.kakao_id;
    locationResponseDto.local_id = location.local_id;
    locationResponseDto.name = location.name;
    locationResponseDto.x = location.x;
    locationResponseDto.y = location.y;
    locationResponseDto.address = location.address;
    if (categoryToNumberMap.get(location.category) < 3)
      locationResponseDto.url = location.url;
    else
      locationResponseDto.url = `https://place.map.kakao.com/${location.kakao_id}`;
    locationResponseDto.category = location.category;
    locationResponseDto.is_lunch = is_lunch;
    return locationResponseDto;
  }
}
