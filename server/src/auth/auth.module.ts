import {Module} from "@nestjs/common";
import {PassportModule} from "@nestjs/passport";

import {UsersModule} from "../user/user.module";
import {SessionSerializer} from "./session.serializer";
import {AuthController} from "./auth.controller";
import {GithubStrategy} from "./strategies/github";
import {TwitterStrategy} from "./strategies/twitter";
import {UsersService} from "../user/users.service";
import { GoogleStrategy } from "./strategies/google";
import {LocalStrategy} from "./strategies/local";
import {AnonymousStrategy} from "./strategies/anonymous";

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
        UsersService,
        AnonymousStrategy
    ],
    controllers: [AuthController],
})
export class AuthModule {
}
