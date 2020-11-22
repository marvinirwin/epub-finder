import fs from 'fs-extra';
import {startCase} from 'lodash';
import {AvailableBooksDto} from "./available-books.dto";
import {UserEntity} from "../entities/user.entity";
import {Book} from "../entities/book.entity";
import {BookViewEntity} from "../entities/book-view.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {CustomBookDto} from "./custom-book.dto";

export class BooksService {
    constructor(
        @InjectRepository(BookViewEntity)
        private bookViewRepository: Repository<BookViewEntity>,

        @InjectRepository(Book)
        private bookRepository: Repository<Book>,
    ) {
    }
    private async booksInBookDir(): Promise<string[]> {
        return (await fs.readdir(process.env.BOOKS_DIR))
            .map(
                filename => startCase(filename.split('.')[0])
            )
    }

    async getAvailableBooksForUser(user: UserEntity): Promise<AvailableBooksDto> {
        return {
            files: await this.booksInBookDir(),
            custom: await this.queryCustomBooksAvailableToUser(user)
        }
    }
    async getAvailableBooksForAnonymous(): Promise<AvailableBooksDto> {
        return {
            files: await this.booksInBookDir(),
            custom: await this.queryGlobalCustomBooks()
        }
    }


    private async queryCustomBooksAvailableToUser(user: UserEntity): Promise<Book[]> {
        return [... await this.queryGlobalCustomBooks(), ... await user.books];
    }

    private async queryGlobalCustomBooks(): Promise<BookViewEntity[]> {
        return await this.bookViewRepository.find({global: true})
    }

    public async saveBook(customBookDto: CustomBookDto): Promise<Book> {
        return await this.bookRepository.save(customBookDto)
    }
}