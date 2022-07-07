import { DatabaseService } from '../Storage/database.service'
import { SettingsService } from '../../services/settings.service'
import { DocumentRepository } from '../documents/document.repository'
import { LtDocument } from 'languagetrainer-server/src/shared'

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

    public async upsertDocument(file: File, language_code: string): Promise<LtDocument> {
        const saved = await this.documentRepository.upsert({
            file,
            language_code
        })
        return saved;
    }
}
