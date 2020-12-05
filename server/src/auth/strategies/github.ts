import {Strategy} from "passport-github2";
import {PassportStrategy} from "@nestjs/passport";
import {Injectable, UnauthorizedException} from "@nestjs/common";
import {UsersService} from "../../user/users.service";
import { User } from "src/entities/user.entity";


@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, "github") {
    constructor(private readonly userService: UsersService) {
        super({
            clientID: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
            callbackURL: `${process.env.BASE_URL}/auth/github/callback`,
            passReqToCallback: true,
            scope: ["user:email"],
        });
    }

    public async validate(_accessToken: string, _refreshToken: string, profile: any): Promise<User> {
        const user = await this.userService.findOne({email: profile.emails[0].value});
        if (user) {
            return user;
        }
        throw new UnauthorizedException();
    }
}
