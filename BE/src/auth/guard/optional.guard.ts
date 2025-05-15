import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard as NestAuthGuard } from "@nestjs/passport";

@Injectable()
export class OptionalGuard extends NestAuthGuard("jwt") {
  handleRequest(err, user, info, context: ExecutionContext) {
    return user;
  }
}
