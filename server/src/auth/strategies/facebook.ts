import {Strategy} from "passport-facebook";
import {PassportStrategy} from "@nestjs/passport";
import {Injectable, UnauthorizedException} from "@nestjs/common";
import {UsersService} from "../../user/users.service";
import { User } from "src/entities/user.entity";


@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, "facebook") {
  constructor(private readonly userService: UsersService) {
    super({
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/auth/facebook/callback`,
      profileFields: ["id", "birthday", "email", "gender", "link", "name", "locale", "picture"],
    });
  }

  public async validate(_accessToken: string, _refreshToken: string, profile: any, ...args: any[]): Promise<User> {
    throw new Error("Not implemented");
    return await this.userService.upsertUserByEmailAndProvider(profile.emails[0].value, 'twitter', profile.id as string);
  }
}
