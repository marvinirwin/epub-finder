import {DatabaseService} from "../Storage/database.service";
import {ReplaySubject} from "rxjs";
import {DocumentToBeSavedDto, DocumentViewDto} from "@server/*";
import {mapFromId} from "../map.module";
import {observableLastValue} from "../../services/settings.service";
import {DocumentRepository} from "../documents/document.repository";

export class LibraryService {
    documents$ = new ReplaySubject<Map<string, DocumentViewDto>>(1)
    db: DatabaseService;

    private documentRepository: DocumentRepository;

    constructor({db, documentRepository}: {
        db: DatabaseService,
        documentRepository: DocumentRepository
    }) {
        this.documentRepository = documentRepository;
        this.db = db;
        this.fetchDocuments();
    }


    private async fetchDocuments() {
        this.documents$.next(mapFromId<string, DocumentViewDto>(await this.documentRepository.all()))
    }

    public async upsertDocument(file: File): Promise<void> {
        await this.documentRepository.upsert({
            file,
        });
        // Inefficient, we probably don't have to fetch all the time
        await this.fetchDocuments();
    }

    public async deleteDocument(instanceId: string, document_id: string): Promise<void> {
        await this.documentRepository.delete(document_id);
        await this.fetchDocuments();
    }
}

