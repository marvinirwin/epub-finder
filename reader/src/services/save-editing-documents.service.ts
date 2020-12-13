import {Observable} from "rxjs";
import {DocumentRepository} from "./document.repository";
import {switchMap} from "rxjs/operators";
import {EditingDocument} from "../lib/editing-documents/editing-document";

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