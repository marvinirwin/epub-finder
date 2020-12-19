import {ReplaySubject} from "rxjs";
import {ds_Dict, IndexedByNumber} from "../Tree/DeltaScanner";
import { DocumentViewDto } from "@server/*";

/**
 * All the documents included in the aggregate document data calculations
 * Right now this functions is just in settings
 */
export class CheckedOutDocumentsService {
    checkedOutDocuments$ = new ReplaySubject<IndexedByNumber<DocumentViewDto>>(1);
}