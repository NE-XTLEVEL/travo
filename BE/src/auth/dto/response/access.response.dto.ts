import { ApiProperty } from "@nestjs/swagger";

export class AccessResponseDto {
  @ApiProperty({
    example:
      "eyJhbGciOiJIUzI1NiIsInR5cCI.eyJpZCI6MSwidHlwZSI6ImFj.INNsR9Hk8hry",
    description: "The access token of the user",
  })
  access_token: string;
}
