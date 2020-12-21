import {DatabaseService} from "../Storage/database.service";
import {ReplaySubject} from "rxjs";
import {DocumentToBeSavedDto, DocumentViewDto} from "@server/*";
import {mapFromId} from "../map.module";
import {observableLastValue, SettingsService} from "../../services/settings.service";
import {DocumentRepository} from "../documents/document.repository";
import {AvailableDocumentsService} from "../documents/available-documents.service";

export class LibraryService {
    documents$ = new ReplaySubject<Map<string, DocumentViewDto>>(1)
    db: DatabaseService;

    private documentRepository: DocumentRepository;
    private availableDocumentsService: AvailableDocumentsService;
    private settingsService: SettingsService;

    constructor({db, documentRepository, availableDocumentsService, settingsService}: {
        db: DatabaseService,
        documentRepository: DocumentRepository,
        availableDocumentsService: AvailableDocumentsService,
        settingsService: SettingsService
    }) {
        this.settingsService = settingsService;
        this.documentRepository = documentRepository;
        this.availableDocumentsService = availableDocumentsService;
        this.db = db;
        this.fetchDocuments();
    }


    private async fetchDocuments() {
        this.documents$.next(mapFromId(await this.documentRepository.all()))
    }

    public async upsertDocument(file: File): Promise<void> {
        const saved = await this.documentRepository.upsert({
            file,
        });
        await this.fetchDocuments();
        this.settingsService.readingDocument$.next(saved.name)
    }

    public async deleteDocument(instanceId: string): Promise<void> {
        await this.documentRepository.delete(instanceId);
        await this.availableDocumentsService.fetchAll();
        await this.fetchDocuments();
    }
}

