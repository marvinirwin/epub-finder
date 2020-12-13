import {Controller, Get, Post, Body, UseGuards} from '@nestjs/common';
import {UsersService} from "./users.service";
import {CreateUserDto} from "./create-user.dto";
import {UserFromReq} from "../decorators/userFromReq";
import {User} from "../entities/user.entity";
import {LoggedInGuard} from "../guards/logged-in.guard";

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {
    }

    @Get('/profile')
    @UseGuards(LoggedInGuard)
    async Profile(@UserFromReq() user: User) {
        return {
            email: user.email
        };
    }
}