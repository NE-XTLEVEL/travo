import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { LocationService } from "./location.service";
import { RecommendationDto } from "./dto/request/recommendation.dto";
import { ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { RecommendationResponseDto } from "./dto/response/recommendation.response.dto";
import { OptionalGuard } from "src/auth/guard/optional.guard";
import { RecommendationOneDto } from "./dto/request/recommendation.one.dto";
import { LocationResponseDto } from "./dto/response/location.response.dto";

@Controller("location")
@ApiBearerAuth("token")
@UseGuards(OptionalGuard)
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post("recommendation")
  @ApiOperation({ summary: "위치 추천" })
  @ApiResponse({
    status: 200,
    description: "위치 추천 성공",
    type: RecommendationResponseDto,
  })
  async getRecommendation(
    @Req() req,
    @Body() recommendationDto: RecommendationDto,
  ): Promise<RecommendationResponseDto> {
    const user = req.user;

    return this.locationService.getRecommendation(user, recommendationDto);
  }

  @Post("recommendation/one")
  @ApiOperation({ summary: "장소 하나에 대한 위치 추천" })
  @ApiResponse({
    status: 201,
    description: "장소 하나에 대한 위치 추천 성공",
    type: LocationResponseDto,
  })
  async getRecommendationOne(
    @Body() recommendationOneDto: RecommendationOneDto,
  ): Promise<LocationResponseDto[]> {
    return this.locationService.getRecommendationOne(recommendationOneDto);
  }
}
