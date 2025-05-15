import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

export class LoginDto {
  @ApiProperty({
    example: "example@email.com",
    description: "The email of the user",
  })
  @IsEmail({}, { message: "유효한 이메일 주소를 입력하세요." })
  email: string;

  @ApiProperty({
    example: "123456",
    description: "The password of the user",
  })
  @IsString({ message: "비밀번호는 문자열이어야 합니다." })
  @MinLength(6, {
    message: "비밀번호는 최소 6자 이상이어야 합니다.",
  })
  @MaxLength(20, {
    message: "비밀번호는 최대 20자 이하이어야 합니다.",
  })
  password: string;
}
