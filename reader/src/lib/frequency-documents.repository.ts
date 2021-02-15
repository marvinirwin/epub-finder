import {BehaviorSubject} from "rxjs";
import {LtDocument} from "@shared/*";
import axios from "axios";
import {DocumentViewDto} from "../../../server/src/documents/document-view.dto";
import {mapFromId, mergeMaps} from "./map.module";

export class FrequencyDocumentsRepository {
    all$ = new BehaviorSubject<Map<string, LtDocument>>(new Map());

    constructor() {
        axios.get(`${process.env.PUBLIC_URL}/documents/frequency-documents`)
            .then(response => {
                    const responseDocuments = ((response?.data || []) as DocumentViewDto[]).map(d => new LtDocument(d));
                    const mappedDocuments = mapFromId<string, LtDocument>(responseDocuments, d => d.id());
                    this.all$.next(mergeMaps(mappedDocuments, this.all$.getValue()));
                }
            )
    }
}