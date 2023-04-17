import {
    observableLastValue,
    SettingsService,
} from '../../services/settings.service'
import { LtDocument } from '@shared/'
import { Observable } from 'rxjs'
import { map, shareReplay } from 'rxjs/operators'
import { DocumentRepository } from '../documents/document.repository'
import { FrequencyDocumentsRepository } from '../documents/frequency-documents.repository'

export class LibraryDocumentRow {
    selectedForFrequency$: Observable<boolean>
    selectedForReading$: Observable<boolean>
    private settingsService: SettingsService
    private readingDocumentRepository: DocumentRepository
    public ltDocument: LtDocument

    constructor({
        settingsService,
        ltDocument,
        readingDocumentRepository,
    }: {
        settingsService: SettingsService
        ltDocument: LtDocument
        readingDocumentRepository: DocumentRepository
        frequencyDocumentRepository: FrequencyDocumentsRepository
    }) {
        this.readingDocumentRepository = readingDocumentRepository
        this.settingsService = settingsService
        this.ltDocument = ltDocument
        this.selectedForReading$ = settingsService.readingDocument$.obs$.pipe(
            // Is the use of id() here not correct?
            // No I think we always use id()
            map((readingDocumentId) => ltDocument.id() === readingDocumentId),
            shareReplay(1),
        )

        this.selectedForFrequency$ = settingsService.selectedFrequencyDocuments$.obs$.pipe(
            map((selectedFrequencyDocumentIds) =>
                selectedFrequencyDocumentIds.includes(ltDocument.id()),
            ),
            shareReplay(1),
        )
    }

    async toggleReading() {
        const mostRecent = await observableLastValue(
            this.settingsService.readingDocument$.obs$,
        )
        if (mostRecent !== this.ltDocument.id()) {
            this.settingsService.readingDocument$.user$.next('')
        } else {
            this.settingsService.readingDocument$.user$.next(this.ltDocument.id())
        }
    }

    async delete() {
        await this.readingDocumentRepository.delete(this.ltDocument)
    }

    async toggleUseForFrequency() {
        const mostRecent = await observableLastValue(
            this.settingsService.selectedFrequencyDocuments$.obs$,
        )
        if (mostRecent.includes(this.ltDocument.id())) {
            this.settingsService.selectedFrequencyDocuments$.user$.next(
                mostRecent.filter((id) => id !== this.ltDocument.id()),
            )
        } else {
            this.settingsService.selectedFrequencyDocuments$.user$.next(
                mostRecent.concat(this.ltDocument.id()),
            )
        }
    }
    async toggleUseForExamples() {
        const mostRecent = await observableLastValue(
            this.settingsService.selectedExampleSegmentDocuments$.obs$,
        )
        const documentIsAlreadySelected = mostRecent.includes(this.ltDocument.id())
        if (documentIsAlreadySelected) {
            this.settingsService.selectedExampleSegmentDocuments$.user$.next(
                mostRecent.filter((id) => id !== this.ltDocument.id()),
            )
        } else {
            this.settingsService.selectedExampleSegmentDocuments$.user$.next(
                mostRecent.concat(this.ltDocument.id()),
            )
        }
    }
}
