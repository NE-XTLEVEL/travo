import { ApiProperty } from "@nestjs/swagger";

export class PlanResponseDto {
  @ApiProperty({
    description: "The ID of the plan",
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: "The name of the plan",
    example: "2박 3일 여행계획",
  })
  plan_name: string;

  static of(plan: any): PlanResponseDto {
    const planResponseDto = new PlanResponseDto();
    planResponseDto.id = plan.id;
    planResponseDto.plan_name = plan.name;
    return planResponseDto;
  }
}
