import fs from 'fs-extra';
import {startCase} from 'lodash';
import {AvailableBooksDto} from "./available-books.dto";
import {User} from "../entities/user.entity";
import {Book} from "../entities/book.entity";
import {BookView} from "../entities/book-view.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {CustomBookDto} from "./custom-book.dto";
import {Inject} from "@nestjs/common";

export class BooksService {
    constructor(
        @InjectRepository(BookView)
        private bookViewRepository: Repository<BookView>,

        @InjectRepository(Book)
        private bookRepository: Repository<Book>,

        @InjectRepository(User)
        private userRepository: Repository<User>
    ) {
    }
    private async booksInBookDir(): Promise<string[]> {
        return (await fs.readdir(process.env.BOOKS_DIR))
            .map(
                filename => startCase(filename.split('.')[0])
            )
    }

    async getAvailableBooksForUser(user: User): Promise<AvailableBooksDto> {
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


    private async queryCustomBooksAvailableToUser(user: User): Promise<Book[]> {
        return [... await this.queryGlobalCustomBooks(), ... await user.books];
    }

    private async queryGlobalCustomBooks(): Promise<BookView[]> {
        return await this.bookViewRepository.find({global: true})
    }

    public async saveBookForUser(user: User, customBookDto: CustomBookDto): Promise<Book> {
        return await this.bookRepository.save({
            ...customBookDto,
            creator_id: user.id,
        })
    }
}