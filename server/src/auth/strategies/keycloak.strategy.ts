import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "../../user/users.service";
import { User } from "src/entities/user.entity";
import Strategy from "@exlinc/keycloak-passport";
import {getRequiredEnvironmentVariables} from "../../util/util";


const {
    KEYCLOAK_URL,
    KEYCLOAK_REALM,
    KEYCLOAK_CLIENT_ID,
    KEYCLOAK_CLIENT_SECRET,
    APP_URL,
    REMOTE_KEYCLOAK_URL
} = getRequiredEnvironmentVariables(
    "KEYCLOAK_URL",
    "KEYCLOAK_REALM",
    "KEYCLOAK_CLIENT_ID",
    "KEYCLOAK_CLIENT_SECRET",
    "APP_URL",
    "REMOTE_KEYCLOAK_URL"
);

@Injectable()
export class KeycloakStrategy extends PassportStrategy(Strategy, "keycloak") {
    constructor(private readonly userService: UsersService) {
        super({
            host: KEYCLOAK_URL,
            // TODO host vs authorizationUrl
            realm: KEYCLOAK_REALM,
            clientID: KEYCLOAK_CLIENT_ID,
            clientSecret: KEYCLOAK_CLIENT_SECRET,
            callbackURL: `${APP_URL}/languagetrainer-auth/keycloak/callback`,
            authorizationURL: `${REMOTE_KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/auth`,
            tokenURL: `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`,
            userInfoURL: `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/userinfo`,
            passReqToCallback: true,
            scope: ['openid']
        });
    }

    public async validate(
        request,
        accessToken,
        unknown,
        profile: {
            email: string;
            fullName: string;
            firstName: string;
            lastName: string;
            keycloakId: string;
        },
        done,
        currentUser
    ): Promise<User> {
        return await this.userService.upsertUserByEmailAndProvider(
            profile.email,
            "keycloak",
            profile.keycloakId,
            currentUser,
        );
    }
}
