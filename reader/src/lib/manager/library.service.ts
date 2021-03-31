import { DatabaseService } from '../Storage/database.service'
import { SettingsService } from '../../services/settings.service'
import { DocumentRepository } from '../documents/document.repository'

export class LibraryService {
    db: DatabaseService

    private documentRepository: DocumentRepository
    private settingsService: SettingsService

    constructor({
        databaseService,
        documentRepository,
        settingsService,
    }: {
        databaseService: DatabaseService
        documentRepository: DocumentRepository
        settingsService: SettingsService
    }) {
        this.settingsService = settingsService
        this.documentRepository = documentRepository
        this.db = databaseService
    }

    public async upsertDocument(file: File, languageCode: string): Promise<void> {
        const saved = await this.documentRepository.upsert({
            file,
            languageCode
        })
        this.settingsService.readingDocument$.next(saved.id())
    }
}
