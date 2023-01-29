import { DocumentRepository } from '../documents/document.repository'
import { OpenDocumentsService } from '../manager/open-documents.service'
import { combineLatest, Observable } from 'rxjs'
import { map, shareReplay } from 'rxjs/operators'

export class LoadingMessagesService {
    private loadingMessages$: Observable<string[]>
    constructor({
        documentRepository,
        openDocumentsService,
    }: {
        documentRepository: DocumentRepository
        openDocumentsService: OpenDocumentsService
    }) {
        this.loadingMessages$ = combineLatest([
            documentRepository.loadingSignal.isLoading$.pipe(
                map((isFetching) => (isFetching ? 'Fetching library' : '')),
            ),
            openDocumentsService.aVirtualTabulationIsLoading$.pipe(
                map((isTabulating) =>
                    isTabulating ? 'Counting words in documents' : '',
                ),
            ),
        ]).pipe(
            map((messages) => messages.filter((v) => v)),
            shareReplay(1),
        )
    }
}
