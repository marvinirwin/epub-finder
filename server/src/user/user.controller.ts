import {Controller, Get, Post, Body, UseGuards, UseInterceptors} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./create-user.dto";
import { UserFromReq } from "../decorators/userFromReq";
import { User } from "../entities/user.entity";
import {LoggingInterceptor} from "../interceptors/logging.interceptor";
import {AnonymousGuard} from "../guards/anonymous.guard";

@Controller("/api/users")
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Get("/profile")
    @UseGuards(AnonymousGuard)
    @UseInterceptors(LoggingInterceptor)
    async Profile(@UserFromReq() user: User) {
        return {
            email: user.email,
        };
    }
}
