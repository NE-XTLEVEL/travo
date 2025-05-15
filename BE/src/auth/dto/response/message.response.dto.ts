import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class MessageResponseDto {
  @ApiProperty({
    example: "메시지입니다.",
    description: "The message of the response",
  })
  @IsString()
  message: string;
}
