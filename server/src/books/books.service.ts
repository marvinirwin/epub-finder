import fs from 'fs-extra';
import {startCase} from 'lodash';
import {User} from "../entities/user.entity";
import {Book} from "../entities/book.entity";
import {BookView} from "../entities/book-view.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {OnModuleInit} from "@nestjs/common";
import {join} from "path";
import {sha1} from "../util/sha1";
import {BookToBeSavedDto} from "./book-to-be-saved.dto";

function CannotFindDocumentForUser(bookIdToDelete: string, user: User) {
    return new Error(`Cannot find existing book with id ${bookIdToDelete} which belongs to user ${user.id}`);
}

export class BooksService implements OnModuleInit {
    constructor(
        @InjectRepository(BookView)
        private bookViewRepository: Repository<BookView>,
        @InjectRepository(Book)
        private documentRepository: Repository<Book>,
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
            const sameVersion = await this.documentRepository.findOne({html_hash: htmlHash, name})
            const baseEntity = {
                name,
                html_hash: htmlHash,
                global: true,
                html,
                creator_id: undefined
            };
            if (!sameVersion) {
                const differentVersion = await this.documentRepository.findOne({name, creator_id: null})
                if (differentVersion) {
                    console.log(`Hash is different, updating ${differentVersion}`);
                    await this.documentRepository.insert({...baseEntity, book_id: differentVersion.book_id});
                } else {
                    console.log(`Inserting ${name} for the first time`);
                    await this.documentRepository.insert(baseEntity)
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
        const savingRevisionOfAnotherBook = !!bookToBeSavedDto.book_id;
        if (savingRevisionOfAnotherBook) {
            if (!await this.documentBelongsToUser(user, bookToBeSavedDto.book_id)) {
                throw CannotFindDocumentForUser(bookToBeSavedDto.book_id, user);
            }
            await this.queryExistingDocumentForUser(user, bookToBeSavedDto.book_id);
        }
        return await this.documentRepository.save({
            ...bookToBeSavedDto,
            creator_id: user.id,
            global: false,
            html_hash: sha1(bookToBeSavedDto.html)
        })
    }

    /**
     * Returns an existing book by book_id belonging to a user
     * Or throws an error if it cannot find it
     * @param user
     * @param bookIdToDelete
     * @private
     */
    private async queryExistingDocumentForUser(user: User, bookIdToDelete: string) {
        const existingBook = await this.queryDocumentForUser(user, bookIdToDelete);
        if (!existingBook) {
            throw CannotFindDocumentForUser(bookIdToDelete, user)
        }
        return existingBook;
    }

    private async queryDocumentForUser(user: User, bookIdToDelete: string) {
        return await this.documentRepository.find({
            creator_id: user.id,
            book_id: bookIdToDelete
        });
    }

    private async documentBelongsToUser(user, book_id) {
        return !!await this.queryDocumentForUser(user, book_id);
    }
}