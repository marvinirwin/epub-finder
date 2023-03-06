import {Controller, Get, Post, Body, UseGuards, UseInterceptors} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./create-user.dto";
import { UserFromReq } from "../decorators/userFromReq";
import { User } from "../entities/user.entity";
import { LoggedInGuard } from "../guards/logged-in.guard";
import {LoggingInterceptor} from "../interceptors/logging.interceptor";

@Controller("/api/users")
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Get("/profile")
    @UseInterceptors(LoggingInterceptor)
    @UseGuards(LoggedInGuard)
    async Profile(@UserFromReq() user: User) {
        return {
            email: user.email,
        };
    }
}
