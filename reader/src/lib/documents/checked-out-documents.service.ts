import {ReplaySubject} from "rxjs";
import {ds_Dict, IndexedByNumber} from "../delta-scan/delta-scan.module";
import { DocumentViewDto } from "@server/*";

/**
 * All the documents included in the aggregate document data calculations
 * Right now this functions is just in settings
 */
export class CheckedOutDocumentsService {
    checkedOutDocuments$ = new ReplaySubject<IndexedByNumber<DocumentViewDto>>(1);
}