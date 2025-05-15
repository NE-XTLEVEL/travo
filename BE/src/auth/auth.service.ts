import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { UserRepository } from "src/user/user.repository";
import { SignUpDto } from "./dto/request/signup.dto";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { LoginDto } from "./dto/request/login.dto";
import * as bcrypt from "bcrypt";
import { MessageResponseDto } from "./dto/response/message.response.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * 회원가입
   * @param {SignUpDto} signUpDto 회원가입 정보
   * @returns {Promise<{ message: string }>} 회원가입 성공 시 메시지
   * @throws {ConflictException} 이미 존재하는 이메일인 경우
   * @throws {ConflictException} 회원가입 실패한 경우
   * */
  async signup(signUpDto: SignUpDto): Promise<MessageResponseDto> {
    const { email } = signUpDto;

    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new ConflictException("이미 존재하는 이메일입니다.");
    }

    const newUser = await this.userRepository.save(signUpDto);

    if (!newUser) {
      throw new ConflictException("회원가입에 실패했습니다.");
    }

    return { message: "회원가입이 완료되었습니다." };
  }

  /**
   * 로그인
   * @param {LoginDto} loginDto 로그인 정보
   * @returns {Promise<{ access_token: string; refresh_token: string }>} 로그인 성공 시 access token과 refresh token
   * @throws {ConflictException} 이메일 또는 비밀번호가 잘못된 경우
   * */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findByEmail(email);

    if (!user || !bcrypt.compare(password, user.password)) {
      throw new ConflictException("이메일 또는 비밀번호가 잘못되었습니다.");
    }

    const access_token = await this.generateAccessToken(user.id);
    const refresh_token = await this.updateRefreshToken(user.id);

    return { access_token, refresh_token };
  }

  /**
   * refresh token으로 access token 재발급
   * @param {string} refresh_token refresh token
   * @returns {Promise<{ access_token: string; refresh_token: string }>} 로그인 성공 시 access token과 refresh token
   * @throws {UnauthorizedException} refresh token이 유효하지 않은 경우
   * */
  async refresh(refresh_token: string) {
    let payload;
    try {
      payload = this.jwtService.verify(refresh_token);
    } catch {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const user = await this.userRepository.findById(payload.id);

    if (!user || user.refresh_token !== refresh_token) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const access_token = await this.generateAccessToken(user.id);
    const new_refresh_token = await this.updateRefreshToken(user.id);

    return { access_token, refresh_token: new_refresh_token };
  }

  /**
   * refresh token 생성 및 DB에 저장
   * @param {number} id 사용자 id
   * @returns {Promise<string>} 새로 생성된 refresh token
   * */
  private async updateRefreshToken(id: number): Promise<string> {
    // payload에 user id와 type을 담아 refresh token 생성
    const payload = { id, type: "refresh" };

    // refresh token 생성
    const refresh_token = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get("REFRESH_TOKEN_EXPIRATION"),
    });

    await this.userRepository.update(id, { refresh_token });

    return refresh_token;
  }

  /**
   * access token 생성
   * @param {number} id 사용자 id
   * @returns {Promise<string>} access token
   * */
  private async generateAccessToken(id: number): Promise<string> {
    const payload = { id, type: "access" };

    // access token 생성
    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get("ACCESS_TOKEN_EXPIRATION"),
    });

    return access_token;
  }
}
