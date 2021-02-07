import {PassportStrategy} from "@nestjs/passport";
import {Injectable, UnauthorizedException} from "@nestjs/common";
import {UsersService} from "../../user/users.service";
import {User} from "src/entities/user.entity";
import Strategy from "@exlinc/keycloak-passport";


@Injectable()
export class KeycloakStrategy extends PassportStrategy(Strategy, "keycloak") {
    constructor(private readonly userService: UsersService) {
        super({
            host: process.env.KEYCLOAK_URL,
            // TODO host vs authorizationUrl
            realm: process.env.KEYCLOAK_REALM,
            clientID: process.env.KEYCLOAK_CLIENT_ID,
            clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
            callbackURL: `/auth/keycloak/callback`,
            authorizationURL: 'TODO',
            tokenURL: 'TODO',
            userInfoURL: 'TODO',
        });
    }

    public async validate(
        accessToken, refreshToken, profile,
        done: Function, request
    ): Promise<User> {
        return await this.userService.upsertUserByEmailAndProvider(
            profile.email,
            'keycloak',
            profile.keycloakId,
            request.user
        );
    }
}
