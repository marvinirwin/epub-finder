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
        this.loadDocuments();
    }


    private async loadDocuments() {
        this.documents$.next(
            mapFromId<string, DocumentViewDto>(await this.documentRepository.queryAll())
        )
        /*
                const builtInDocuments = [
                    'a-burning-oven.html',
                    'cat-likes-tea.html',
                    'city-and-village.html',
                    'watching-a-movie.html',
                ].map(websiteFromFilename);
                this.appendBuiltInDocuments(builtInDocuments);
        */
    }


    public async addAndPersistDocumentRevision(d: DocumentToBeSavedDto): Promise<void> {
        const savedDocument = await this.documentRepository.upsert(d);
        this.loadDocuments();
    }

    public async PersistFile(
        file: File,
        b: DocumentToBeSavedDto
    ): Promise<void> {
        // Uplaod the file with the headers
    }

    public async deleteDocument(instanceId: string, document_id: string): Promise<void> {
        await this.documentRepository
            .upsert(
                {
                    document_id,
                    deleted: true, html: '', name: ''
                }
            );
        this.loadDocuments();
    }
}

