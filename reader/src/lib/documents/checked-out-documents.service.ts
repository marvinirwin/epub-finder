import {ReplaySubject} from "rxjs";
import {ds_Dict, IndexedByNumber} from "../Tree/DeltaScanner";
import { BookViewDto } from "@server/*";

/**
 * All the documents included in the aggregate document data calculations
 * Right now this functions is just in settings
 */
export class CheckedOutBooksService {
    checkedOutBooks$ = new ReplaySubject<IndexedByNumber<BookViewDto>>(1);

}