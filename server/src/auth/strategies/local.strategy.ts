// eslint-disable-next-line import/named
import {Strategy} from "passport-local";
import {PassportStrategy} from "@nestjs/passport";
import {Injectable, UnauthorizedException} from "@nestjs/common";

import {User} from "../../entities/user.entity";
import {UsersService} from "../../user/users.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UsersService) {
    super({
      usernameField: "email",
      passwordField: "password",
    });
  }

  public async validate(email: string, password: string): Promise<User> {
    const userEntity = await this.userService.findForAuth(email, password);

    if (userEntity) {
        return userEntity;
    }

    throw new UnauthorizedException();
  }
}
