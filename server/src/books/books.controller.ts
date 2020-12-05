import {Body, Controller, Get, Post, Put} from "@nestjs/common";
import {BooksService} from "./books.service";
import {UserFromReq} from "../decorators/userFromReq";
import {User} from "../entities/user.entity";
import {CustomBookDto} from "./custom-book.dto";

@Controller('books')
export class BooksController {
    constructor( private booksService: BooksService ) {

    }

    @Get()
    async availableBooks(
        @UserFromReq() user: User | undefined
    ) {
        if (user) {
            return this.booksService.getAvailableBooksForUser(user)
        }
        return this.booksService.getAvailableBooksForAnonymous()
    }

    @Put()
    async putBook(
        @UserFromReq() user: User | undefined,
        @Body() customBookDto: CustomBookDto
    ) {
        if (!user) {
            return undefined;
        }
        return this.booksService.saveBook(customBookDto)
    }
}