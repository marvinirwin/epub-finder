import {ReplaySubject} from "rxjs";
import {ds_Dict, IndexedByNumber} from "../Tree/DeltaScanner";
import { BookViewDto } from "@server/*";

/**
 * All the books included in the aggregate book data calculations
 * Right now this functions is just in settings
 */
export class CheckedOutBooksService {
    checkedOutBooks$ = new ReplaySubject<IndexedByNumber<BookViewDto>>(1);

}