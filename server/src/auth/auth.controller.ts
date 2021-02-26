import {Request, Response} from "express";
import {Body, Controller, Get, Post, Req, Res, HttpCode, UseGuards, Redirect} from "@nestjs/common";

import {User} from "../entities/user.entity";
import {UsersService} from "../user/users.service";
import {Public} from "src/decorators/public";
import {UserFromReq} from "../decorators/userFromReq";
import {KeycloakGuard} from "../guards/keycloak.guard";
import {LoginGuard} from "../guards/login.guard";
@Controller("/languagetrainer-auth")
export class AuthController {
    constructor(
        private readonly userService: UsersService
    ) {
    }


    @Post('/signup')
    public async signup(
        @Body() {email, password}: { email: string, password: string },
        @UserFromReq() user: User | undefined ) {
        if (process.env.PROD) {
            throw new Error("basic signup only available in test")
        }
        return await this.userService.signUpBasicUser(
            {email, password},
            user
            );
    }

    @UseGuards(LoginGuard)
    @Post("/login")
    public login(@UserFromReq() user: User): User {
        if (process.env.PROD) {
            throw new Error("basic login only available in test")
        }
        return user;
    }

    @HttpCode(204)
    @Get("/logout")
    public logout(@Req() req: Request, @Res() res: Response): void {
        // @ts-ignore
        req.session.destroy();
        req.logout();
        res.clearCookie("nest");
        res.send("");
    }

    @Public()
    @Get("/keycloak")
    @UseGuards(KeycloakGuard)
    public googleLogin(): void {
        // initiates the Google OAuth2 login flow
    }

    @Public()
    @Get("/keycloak/callback")
    @UseGuards(KeycloakGuard)
    @Redirect(process.env.BA1SE_URL)
    public googleLoginCallback(@UserFromReq() user: User): string {
        // Redirect to index.html
        return '';
    }
}
