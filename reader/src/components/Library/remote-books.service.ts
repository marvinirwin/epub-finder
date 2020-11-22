import {ReplaySubject} from "rxjs";
import {LibraryBook} from "./library-book.class";
import axios from 'axios';

export class RemoteBooksService {
    remoteBooks$ = new ReplaySubject<LibraryBook[]>()
    constructor() {
        this.fetchRemoteBooks()
    }
    public async fetchRemoteBooks() {
        const response = await axios.get(`${process.env.PUBLIC_URL}/books`);
        this.remoteBooks$.next(response.data);
    }
}