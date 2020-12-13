import {DatabaseService} from "../Storage/database.service";
import {DocumentRepository} from "../../services/document.repository";
import {ReplaySubject} from "rxjs";
import { BookViewDto, BookToBeSavedDto } from "@server/*";
import {mapFromId} from "../map.module";
import {replaySubjectLastValue} from "../../services/settings.service";

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


    public async addAndPersistDocumentRevision(d: BookToBeSavedDto): Promise<BookViewDto> {
        const latestDocuments = await replaySubjectLastValue(this.documents$);
        const savedDocument = await this.documentRepository.persistDocument(d);
        this.documents$.next(new Map(latestDocuments.set(savedDocument.id, savedDocument)))
        return savedDocument;
    }
}

