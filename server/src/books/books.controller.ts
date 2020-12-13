import {Body, Controller, Get, Post, Put, UploadedFile, UseGuards, UseInterceptors} from "@nestjs/common";
import {BooksService} from "./books.service";
import {UserFromReq} from "../decorators/userFromReq";
import {User} from "../entities/user.entity";
import {CustomBookDto} from "./custom-book.dto";
import {FileInterceptor} from "@nestjs/platform-express";
import {LoggedInGuard} from "../guards/logged-in.guard";

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
    @UseGuards(LoggedInGuard)
    async putBook(
        @UserFromReq() user: User,
        @Body() customBookDto: CustomBookDto
    ) {
        return this.booksService.saveBookForUser(user, customBookDto)
    }

/*
    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async putFile(@UserFromReq() user: User | undefined, @UploadedFile() file) {
    }
*/
}