import {DatabaseService} from "../Storage/database.service";
import {ReplaySubject} from "rxjs";
import {BookToBeSavedDto, BookViewDto} from "@server/*";
import {mapFromId} from "../map.module";
import {observableLastValue} from "../../services/settings.service";
import {DocumentRepository} from "../documents/document.repository";

export class LibraryService {
    documents$ = new ReplaySubject<Map<string, BookViewDto>>(1)

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
            mapFromId<string, BookViewDto>(await this.documentRepository.fetchRemoteDocuments())
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


    public async addAndPersistDocumentRevision(d: BookToBeSavedDto): Promise<void> {
        const savedDocument = await this.documentRepository.persistDocument(d);
        this.loadDocuments();
    }

    public async PersistFile(
        file: File,
        b: BookToBeSavedDto
    ): Promise<void> {
        // Uplaod the file with the headers
    }

    public async deleteDocument(instanceId: string, document_id: string): Promise<void> {
        await this.documentRepository
            .persistDocument(
                {
                    document_id,
                    deleted: true, html: '', name: ''
                }
            );
        this.loadDocuments();
    }
}

