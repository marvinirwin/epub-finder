import {EditingDocument} from "../lib/editing-documents/editing-document";

export class EditingBooksService {
    rawBook$ = new EditingDocument();
    simpleBook$ = new EditingDocument();
    constructor() {
    }


}