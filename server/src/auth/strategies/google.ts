import {Strategy} from "passport-google-oauth20";
import {PassportStrategy} from "@nestjs/passport";
import {Injectable, UnauthorizedException} from "@nestjs/common";
import {UsersService} from "../../user/users.service";
import {User} from "src/entities/user.entity";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
    constructor(private readonly userService: UsersService) {
        super({
            clientID: process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_SECRET,
            callbackURL: `${process.env.BASE_URL}/auth/google/callback`,
            passReqToCallback: true,
            scope: ['email', 'profile']
        });
    }

    public async validate(
        request: any,
        accessToken: string,
        refreshToken: string,
        profile,
        done: Function
    ): Promise<User> {
        return await this.userService.upsertUserByEmailAndProvider(
            profile.emails[0].value,
            'google',
            profile.id,
            request.user
        );
    }
}
