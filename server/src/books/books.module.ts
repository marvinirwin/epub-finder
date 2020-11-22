import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Book} from "../entities/book.entity";
import {BookViewEntity} from "../entities/book-view.entity";
import {BooksController} from "./books.controller";
import {BooksService} from "./books.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([Book, BookViewEntity])
    ],
    controllers: [
        BooksController
    ],
    providers: [
        BooksService
    ]
})
export class BooksModule {}
