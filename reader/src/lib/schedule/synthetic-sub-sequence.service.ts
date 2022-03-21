import { Observable } from 'rxjs'
import { TemporaryHighlightService } from '../highlighting/temporary-highlight.service'
import { map } from 'rxjs/operators'

export class SyntheticSubSequenceService {
    syntheticSubSequences$: Observable<Set<string>>
    constructor({temporaryHighlightService }: { temporaryHighlightService: TemporaryHighlightService}) {
        this.syntheticSubSequences$ = temporaryHighlightService.temporaryHighlightRequests$.pipe(
            map((temporaryHighlightRequest => {
                const s = new Set<string>();
                if (temporaryHighlightRequest?.word) {
                    s.add(temporaryHighlightRequest.word)
                }
                return s;
            }))
        )
        // TODO make this based off of what is highlighted
    }
}