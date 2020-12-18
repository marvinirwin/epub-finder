import {Observable} from "rxjs";
import {switchMap} from "rxjs/operators";
import {EditingDocument} from "../lib/editing-documents/editing-document";
import {DocumentRepository} from "../lib/documents/document.repository";

export class SaveEditingDocumentsService {
    constructor(
        {
            editingDocuments$,
            documentRepository
        }: { editingDocuments$: Observable<EditingDocument[]>, documentRepository: DocumentRepository }) {

        editingDocuments$.pipe(
            switchMap(
                editingDocuments =>
                    editingDocuments$
            )
        )
    }
}