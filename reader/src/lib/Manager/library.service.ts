import {DatabaseService} from "../Storage/database.service";
import {ReplaySubject} from "rxjs";
import { BookViewDto, BookToBeSavedDto } from "@server/*";
import {mapFromId} from "../map.module";
import {observableLastValue} from "../../services/settings.service";
import {DocumentRepository} from "../documents/document.repository";

export class LibraryService {
    documents$ = new ReplaySubject<Map<number, BookViewDto>>(1)

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
        this.documents$.next(mapFromId(await this.documentRepository.fetchRemoteDocuments()))
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


    public async addAndPersistDocumentRevision(d: BookToBeSavedDto): Promise<BookViewDto | undefined> {
        const latestDocuments = await observableLastValue(this.documents$);
        const savedDocument = await this.documentRepository.persistDocument(d);
        if (savedDocument) {
            this.documents$.next(new Map(latestDocuments.set(savedDocument.id, savedDocument)))
            return savedDocument;
        }
    }
}

