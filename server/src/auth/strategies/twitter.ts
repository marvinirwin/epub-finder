import {Strategy} from "passport-twitter";
import {PassportStrategy} from "@nestjs/passport";
import {Injectable, UnauthorizedException} from "@nestjs/common";
import {UsersService} from "../../user/users.service";
import { User } from "src/entities/user.entity";


@Injectable()
export class TwitterStrategy extends PassportStrategy(Strategy, "twitter") {
    constructor(private readonly userService: UsersService) {
        super({
            consumerKey: process.env.TWITTER_API_KEY,
            consumerSecret: process.env.TWITTER_API_KEY_SECRET,
            callbackURL: `${process.env.BASE_URL}/auth/twitter/callback`,
            passReqToCallback: true,
        });
    }

    public async validate(_accessToken: string, _refreshToken: string, profile: any, ...args: any[]): Promise<User> {
        throw new Error("Not implemented")
    }
}
