import {Request, Response} from "express";
import {Body, Controller, Get, Post, Req, Res, HttpCode, UseGuards, Redirect} from "@nestjs/common";

import {User} from "../entities/user.entity";
import {UsersService} from "../user/users.service";
import {Public} from "src/decorators/public";
import {UserFromReq} from "../decorators/userFromReq";

@Controller("/auth")
export class AuthController {
    constructor(
        private readonly userService: UsersService
    ) {
    }


    @Public()
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

    @Public()
    @Post("/login")
    public login(@UserFromReq() user: User): User {
        if (process.env.PROD) {
            throw new Error("basic login only available in test")
        }
        return user;
    }

    @Public()
    @HttpCode(204)
    @Get("/logout")
    public logout(@Req() req: Request, @Res() res: Response): void {
        // @ts-ignore
        req.session.destroy();
        req.logout();
        res.clearCookie("nest");
        res.send("");
    }
}
