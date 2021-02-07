import {Module} from "@nestjs/common";
import {PassportModule} from "@nestjs/passport";

import {UsersModule} from "../user/user.module";
import {SessionSerializer} from "./session.serializer";
import {AuthController} from "./auth.controller";
import {UsersService} from "../user/users.service";
import {LocalStrategy} from "./strategies/local.strategy";
import {AnonymousStrategy} from "./strategies/anonymous.strategy";
import {KeycloakStrategy} from "./strategies/keycloak.strategy";

@Module({
    imports: [
        UsersModule,
        PassportModule,
    ],
    providers: [
        KeycloakStrategy,
        LocalStrategy,
        SessionSerializer,
        UsersService,
        AnonymousStrategy
    ],
    controllers: [AuthController],
})
export class AuthModule {
}
