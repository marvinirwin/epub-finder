import fs from 'fs-extra';
import {startCase} from 'lodash';
import {AvailableBooksDto} from "./available-books.dto";
import {UserEntity} from "../entities/user.entity";
import {BookEntity} from "../entities/book.entity";
import {BookViewEntity} from "../entities/book-view.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {CustomBookDto} from "./custom-book.dto";

export class BooksService {
    constructor(
        @InjectRepository(BookViewEntity)
        private bookViewRepository: Repository<BookViewEntity>,

        @InjectRepository(BookEntity)
        private bookRepository: Repository<BookEntity>,
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

    private async queryCustomBooksAvailableToUser(user: UserEntity): Promise<BookEntity[]> {
        return [... await this.queryGlobalCustomBooks(), ... await user.books];
    }

    private async queryGlobalCustomBooks(): Promise<BookViewEntity[]> {
        return await this.bookViewRepository.find({global: true})
    }

    public async saveBook(customBookDto: CustomBookDto): Promise<BookEntity> {
        return await this.bookRepository.save(customBookDto)
    }
}