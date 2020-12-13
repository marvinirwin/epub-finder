import {Controller, Get, Post, Body} from '@nestjs/common';
import {UsersService} from "./users.service";
import {CreateUserDto} from "./create-user.dto";
import {UserFromReq} from "../decorators/userFromReq";
import {User} from "../entities/user.entity";

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {
    }

    @Get('/profile')
    async Profile(@UserFromReq() user: User) {
        return {
            email: user.email
        };
    }
}