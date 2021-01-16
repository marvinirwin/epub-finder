import {DatabaseService} from "../Storage/database.service";
import {ReplaySubject} from "rxjs";
import { DocumentViewDto} from "@server/*";
import {SettingsService} from "../../services/settings.service";
import {DocumentRepository} from "../documents/document.repository";

export class LibraryService {
    db: DatabaseService;

    private documentRepository: DocumentRepository;
    private settingsService: SettingsService;

    constructor({db, documentRepository, settingsService}: {
        db: DatabaseService,
        documentRepository: DocumentRepository,
        settingsService: SettingsService
    }) {
        this.settingsService = settingsService;
        this.documentRepository = documentRepository;
        this.db = db;
    }

    public async upsertDocument(file: File): Promise<void> {
        const saved = await this.documentRepository.upsert({
            file,
        });
        this.settingsService.readingDocument$.next(saved.name)
    }

    public async deleteDocument(instanceId: string): Promise<void> {
        await this.documentRepository.delete(instanceId);
    }
}

