import {Controller, Get, Post} from "@nestjs/common";
import {UsersService} from "../user/users.service";
import {BooksService} from "./books.service";
import {UserFromReq} from "../decorators/userFromReq";
import {UserEntity} from "../entities/user.entity";

@Controller('books')
export class BooksController {
    constructor( private booksService: BooksService ) {

    }

    @Get()
    async availableBooks(
        @UserFromReq() user: UserEntity | undefined
    ) {
        if (user) {
            return this.booksService.getAvailableBooksForUser(user)
        }
        return this.booksService.getAvailableBooksForAnonymous()
    }
}