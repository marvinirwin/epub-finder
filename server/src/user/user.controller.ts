import { Controller, Get, Post, Body } from '@nestjs/common';
import {UsersService} from "./users.service";
import {CreateUserDto} from "./create-user.dto";

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Post()
    async create(createUserDto: CreateUserDto) {
        return this.usersService.createBasicUser(createUserDto);
    }
}