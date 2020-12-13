/**
 * All books available remotely
 */
import { ReplaySubject} from "rxjs";
import { BookViewDto } from "@server/*";
import axios from "axios";


export interface AvailableBookDto {
    name: string;
    id: number;
}

export class AvailableBooksService {
    available$ = new ReplaySubject<AvailableBookDto[]>(1)
    constructor() {
        this.available$.next([]);
        this.fetchAvailableBooks()
    }

    async fetchAvailableBooks(): Promise<void> {
        const response = await axios.get(`${process.env.PUBLIC_URL}/books/available`);
        /**
         * TODO find a way to retrieve just their names, or their names + ids
         */
        // If there's no data there will be an error, which will appear in the toast
        response?.data && this.available$.next(response.data as BookViewDto[]);
    }

    fetchBook(a: AvailableBookDto): Promise<BookViewDto> {
        return axios.get(`${process.env.PUBLIC_URL}/books/${a.id}`)
            .then(response => response.data);
    }
}