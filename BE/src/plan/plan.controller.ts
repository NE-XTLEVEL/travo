import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Put,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { PlanService } from "./plan.service";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guard/jwt.guard";
import { PlanResponseDto } from "./dto/response/plan.response.dto";
import { RecommendationResponseDto } from "src/location/dto/response/recommendation.response.dto";
import { UpdatePlanDto } from "./dto/request/update.plan.dto";
import { MessageResponseDto } from "src/auth/dto/response/message.response.dto";
import { UpdatePlanNameDto } from "./dto/request/update.plan_name.dto";

@Controller("plan")
@ApiBearerAuth("token")
@UseGuards(JwtAuthGuard)
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Get("all")
  @ApiOperation({
    summary: "Get all plans",
    description: "Get all plans for the user",
  })
  @ApiQuery({
    name: "cursor",
    required: false,
    description: "Cursor for pagination",
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: "List of plans",
    type: [PlanResponseDto],
  })
  async getPlans(
    @Req() req,
    @Query("cursor") cursor?: number,
  ): Promise<PlanResponseDto[]> {
    const { user } = req;

    return await this.planService.getPlans(user.id, cursor);
  }

  @Get(":plan_id")
  @ApiOperation({
    summary: "Get plan by ID",
    description: "Get a specific plan by its ID",
  })
  @ApiResponse({
    status: 200,
    description: "Plan details",
    type: RecommendationResponseDto,
  })
  async getPlan(
    @Req() req,
    @Param("plan_id") plan_id: number,
  ): Promise<RecommendationResponseDto> {
    const { user } = req;

    return await this.planService.getPlan(user.id, plan_id);
  }

  @Put(":plan_id")
  @ApiOperation({
    summary: "Update plan by ID",
    description: "Update a specific plan by its ID",
  })
  @ApiResponse({
    status: 200,
    description: "Plan updated successfully",
    type: MessageResponseDto,
  })
  async updatePlan(
    @Req() req,
    @Param("plan_id") plan_id: number,
    @Body() updatePlanDto: UpdatePlanDto,
  ): Promise<MessageResponseDto> {
    const { user } = req;

    return await this.planService.updatePlan(plan_id, user.id, updatePlanDto);
  }

  @Patch("name/:plan_id")
  @ApiOperation({
    summary: "Update plan name",
    description: "Update the name of a specific plan by its ID",
  })
  @ApiResponse({
    status: 200,
    description: "Plan name updated successfully",
    type: MessageResponseDto,
  })
  async updatePlanName(
    @Req() req,
    @Param("plan_id") plan_id: number,
    @Body() updatePlanNameDto: UpdatePlanNameDto,
  ): Promise<MessageResponseDto> {
    const { user } = req;

    return await this.planService.updatePlanName(
      plan_id,
      user.id,
      updatePlanNameDto,
    );
  }
}
