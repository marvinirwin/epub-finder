/**
 * All documents available remotely
 */
import { ReplaySubject} from "rxjs";
import { AvailableDocumentDto } from "@server/*";
import {AvailableDocumentRepository} from "./available-document.repository";



export class AvailableDocumentsService {
    available$ = new ReplaySubject<AvailableDocumentDto[]>(1)
    constructor() {
        this.available$.next([]);
        this.fetchAll()
    }

    async fetchAll(): Promise<void> {
        this.available$.next(await AvailableDocumentRepository.all());
    }
}