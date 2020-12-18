import {EditingDocument} from "../lib/editing-documents/editing-document";

export class EditingDocumentsService {
    rawDocument$ = new EditingDocument();
    simpleDocument$ = new EditingDocument();
    constructor() {
    }


}