import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy, VerifiedCallback } from "passport-jwt";
import { UserRepository } from "src/user/user.repository";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(private userRepository: UserRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: Payload, done: VerifiedCallback): Promise<void> {
    const { id } = payload;
    const user = await this.userRepository.findById(id);

    if (!user) {
      done(new UnauthorizedException({ message: "회원 존재하지 않음." }), null);
    } // user가 존재하지 않는 경우 Exception 발생

    return done(null, user);
  }
}

export interface Payload {
  id: number;
}
