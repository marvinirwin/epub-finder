/**
 * All documents available remotely
 */
import { ReplaySubject} from "rxjs";
import { DocumentViewDto, AvailableBookDto } from "@server/*";
import axios from "axios";



export class AvailableBooksService {
    available$ = new ReplaySubject<AvailableBookDto[]>(1)
    constructor() {
        this.available$.next([]);
        this.fetchAvailableBooks()
    }

    async fetchAvailableBooks(): Promise<void> {
        const response = await axios.get(`${process.env.PUBLIC_URL}/documents/available`);
        /**
         * TODO find a way to retrieve just their names, or their names + ids
         */
        // If there's no data there will be an error, which will appear in the toast
        response?.data && this.available$.next(response.data as AvailableBookDto[]);
    }

/*
    fetchBook(a: AvailableBookDto): Promise<BookViewDto> {
        return axios.get(`${process.env.PUBLIC_URL}/documents/${a.id}`)
            .then(response => response.data);
    }
*/
}