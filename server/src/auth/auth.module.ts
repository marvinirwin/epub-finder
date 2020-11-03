import {Module} from "@nestjs/common";
import {PassportModule} from "@nestjs/passport";

import {UsersModule} from "../user/user.module";
import {SessionSerializer} from "./session.serializer";
import {AuthController} from "./auth.controller";
import {GoogleStrategy, LocalStrategy} from "./strategies";
import {GithubStrategy} from "./strategies/github";
import {TwitterStrategy} from "./strategies/twitter";
import {UsersService} from "../user/users.service";

@Module({
    imports: [
        UsersModule,
        PassportModule,
    ],
    providers: [
        GithubStrategy,
        TwitterStrategy,
        GoogleStrategy,
        LocalStrategy,
        SessionSerializer,
        UsersService
    ],
    controllers: [AuthController],
})
export class AuthModule {
}
