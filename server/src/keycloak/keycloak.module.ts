import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import {
    KeycloakConnectModule,
    ResourceGuard,
    RoleGuard,
    AuthGuard,
} from 'nest-keycloak-connect';

@Module({
    imports: [
        KeycloakConnectModule.register({
            authServerUrl: process.env.KEYCLOAK_URL,
            realm: process.env.KEYCLOAK_REALM,
            clientId: process.env.KEYCLOAK_CLIENT_ID,
            secret: process.env.KEYCLOAK_SECRET,
            // optional if you want to retrieve JWT from cookie
            cookieKey: process.env.KEYCLOAK_COOKIE_KEY,
        }),
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: AuthGuard,
        },
        {
            provide: APP_GUARD,
            useClass: ResourceGuard,
        },
        {
            provide: APP_GUARD,
            useClass: RoleGuard,
        },
    ],
})
export class KeycloakModule {}