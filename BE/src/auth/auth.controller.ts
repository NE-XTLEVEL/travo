import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignUpDto } from "./dto/request/signup.dto";
import { ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { JwtAuthGuard } from "./guard/jwt.guard";
import { Request, Response } from "express";
import { LoginDto } from "./dto/request/login.dto";
import { MessageResponseDto } from "./dto/response/message.response.dto";
import { AccessResponseDto } from "./dto/response/access.response.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  @ApiOperation({ summary: "회원가입" })
  @ApiResponse({
    status: 201,
    description: "회원가입 성공",
    type: MessageResponseDto,
  })
  async signup(@Body() signUpDto: SignUpDto): Promise<MessageResponseDto> {
    return this.authService.signup(signUpDto);
  }

  @Post("login")
  @ApiOperation({ summary: "로그인" })
  @ApiResponse({
    status: 201,
    description: "로그인 성공",
    type: AccessResponseDto,
  })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AccessResponseDto> {
    const { access_token, refresh_token } =
      await this.authService.login(loginDto);

    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 604800000,
      domain: ".travo.kr",
    }); // refresh token cookie에 저장, 7일 유효

    return { access_token };
  }

  @Post("logout")
  @ApiOperation({
    summary: "로그아웃",
    description: "access token, refresh token 삭제",
  })
  @ApiBearerAuth("token")
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 201,
    description: "로그아웃 성공",
    type: MessageResponseDto,
  })
  async logout(
    @Res({ passthrough: true }) res: Response,
  ): Promise<MessageResponseDto> {
    // refresh token 쿠키 삭제
    res.clearCookie("refresh_token", { domain: ".travo.kr" }); // refresh token cookie 삭제
    return { message: "logout success" };
  }

  @Post("refresh")
  @ApiOperation({
    summary: "access token 재발급",
    description: "refresh token으로 access token 재발급",
  })
  @ApiBearerAuth("token")
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 201,
    description: "access token 재발급 성공",
    type: AccessResponseDto,
  })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AccessResponseDto> {
    if (!req.cookies["refresh_token"]) {
      throw new NotFoundException("refresh token이 없습니다.");
    } // refresh token이 없으면 에러

    const { access_token, refresh_token } = await this.authService.refresh(
      req.cookies["refresh_token"],
    ); // refresh token으로 access token 재발급

    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 604800000,
      domain: ".travo.kr",
    }); // refresh token cookie에 저장, 7일 유효

    return { access_token };
  }

  @Get("check")
  @ApiOperation({
    summary: "access token 유효성 검사",
    description: "access token이 유효한지 검사",
  })
  @ApiBearerAuth("token")
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: "access token 유효성 검사 성공",
    type: MessageResponseDto,
  })
  // eslint-disable-next-line
  async check(@Req() req: Request): Promise<MessageResponseDto> {
    return { message: "access token is valid" }; // access token이 유효한지 검사
  } // access token이 유효한지 검사
}
