import fs from 'fs-extra';
import {startCase} from 'lodash';
import {User} from "../entities/user.entity";
import {Book} from "../entities/book.entity";
import {BookView} from "../entities/book-view.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {Inject, OnModuleInit} from "@nestjs/common";
import {join} from "path";
import {sha1} from "../util/sha1";
import {BookToBeSavedDto} from "./saving-book.dto";

export class BooksService implements OnModuleInit {
    constructor(
        @InjectRepository(BookView)
        private bookViewRepository: Repository<BookView>,
        @InjectRepository(Book)
        private bookRepository: Repository<Book>,
        @InjectRepository(User)
        private userRepository: Repository<User>
    ) {
    }

    async onModuleInit() {
        this.insertBooksInBooksDir();
    }

    private async insertBooksInBooksDir() {
        // Get all the books, get their hashes, compare with the current books
        const books = await Promise.all(
            (await fs.readdir(process.env.BOOKS_DIR))
                .filter(filename => filename.endsWith('.html'))
                .map(filename => fs.readFile(join(process.env.BOOKS_DIR, filename))
                    .then(content => ({filename, html: content.toString()}))// Do I have to add UTF-8 here?
                )
        );
        for (let i = 0; i < books.length; i++) {
            const {filename, html} = books[i];
            const htmlHash = sha1(html);
            const name = startCase(filename);
            const sameVersion = await this.bookRepository.findOne({html_hash: htmlHash, name})
            const baseEntity = {
                name,
                html_hash: htmlHash,
                global: true,
                html,
                creator_id: undefined
            };
            if (!sameVersion) {
                const differentVersion = await this.bookRepository.findOne({name, creator_id: null})
                if (differentVersion) {
                    console.log(`Hash is different, updating ${differentVersion}`);
                    await this.bookRepository.insert({...baseEntity, book_id: differentVersion.book_id});
                } else {
                    console.log(`Inserting ${name} for the first time`);
                    await this.bookRepository.insert(baseEntity)
                }
            } else {
                console.log(`${name} already exists`)
            }
        }
    }

    async queryAvailableBooks(user?: User | undefined): Promise<BookView[]> {
        return await this.bookViewRepository
            .find({
                    where: [
                        {creator_id: user?.id},
                        {global: true}
                    ]
                }
            )
    }

    public async saveBookForUser(user: User, bookToBeSavedDto: BookToBeSavedDto): Promise<Book> {
        return await this.bookRepository.save({
            ...bookToBeSavedDto,
            creator_id: user.id,
        })
    }
}