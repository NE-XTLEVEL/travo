import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { LoginDto } from "./login.dto";

export class SignUpDto extends LoginDto {
  @ApiProperty({
    example: "John Doe",
    description: "The name of the user",
  })
  @IsString({ message: "이름은 문자열이어야 합니다." })
  name: string;
}
