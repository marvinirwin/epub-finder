import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Book} from "../entities/book.entity";
import {BookView} from "../entities/book-view.entity";
import {BooksController} from "./books.controller";
import {BooksService} from "./books.service";
import {User} from "../entities/user.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Book, BookView, User]),

    ],
    controllers: [
        BooksController
    ],
    providers: [
        BooksService
    ]
})
export class BooksModule {}
