import {Body, Controller, Get, Post, Put, UploadedFile, UseGuards, UseInterceptors} from "@nestjs/common";
import {BooksService} from "./books.service";
import {UserFromReq} from "../decorators/userFromReq";
import {User} from "../entities/user.entity";
import {LoggedInGuard} from "../guards/logged-in.guard";
import {BookToBeSavedDto} from "./book-to-be-saved.dto";

@Controller('books')
export class BooksController {
    constructor( private booksService: BooksService ) {

    }

    @Get('/available')
    async availableBooks(
        @UserFromReq() user: User | undefined
    ) {
        return this.booksService.queryAvailableBooks(user)
            .then(availableBooks => availableBooks.map(bookView => ({
                name: bookView.name,
                id: bookView.id,
                lastModified: bookView.created_at,
                belongsToUser: bookView.creator_id === user?.id
            })))
    }
    @Get('/all')
    async allBooks(
        @UserFromReq() user: User | undefined
    ) {
        return this.booksService.queryAvailableBooks(user)
    }

    @Put()
    @UseGuards(LoggedInGuard)
    async putBook(
        @UserFromReq() user: User,
        @Body() bookToBeSavedDto: BookToBeSavedDto
    ) {
        return this.booksService.saveBookForUser(user, bookToBeSavedDto)
    }

/*
    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async putFile(@UserFromReq() user: User | undefined, @UploadedFile() file) {
    }
*/
}