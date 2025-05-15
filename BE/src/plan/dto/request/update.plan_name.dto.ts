import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength, MinLength } from "class-validator";

export class UpdatePlanNameDto {
  @ApiProperty({
    type: "string",
    example: "여름휴가",
  })
  @IsString({ message: "name must be a string" })
  @MinLength(1, { message: "name must be at least 1 character long" })
  @MaxLength(10, { message: "name must be at most 20 characters long" })
  name: string;
}
