import {PronunciationProgressRepository} from "./schedule/pronunciation-progress.repository";
import {WordRecognitionProgressRepository} from "./schedule/word-recognition-progress.repository";
import {SetWithUniqueLengths} from "../../../server/src/shared/tabulate-documents/set-with-unique-lengths";
import {combineLatest, Observable} from "rxjs";
import {map, shareReplay} from "rxjs/operators";
import {TemporaryHighlightService} from "./highlighting/temporary-highlight.service";
import {VideoMetadataRepository} from "../services/video-metadata.repository";

export class NotableSubsequencesService {
    notableSubsequenceSet$: Observable<SetWithUniqueLengths>

    constructor(
        {
            pronunciationProgressService,
            wordRecognitionProgressService,
            temporaryHighlightService,
            videoMetadataRepository
        }: {
            pronunciationProgressService: PronunciationProgressRepository;
            wordRecognitionProgressService: WordRecognitionProgressRepository;
            temporaryHighlightService: TemporaryHighlightService;
            videoMetadataRepository: VideoMetadataRepository;
        }
    ) {
        this.notableSubsequenceSet$ = combineLatest([
            pronunciationProgressService.records$,
            wordRecognitionProgressService.records$,
            temporaryHighlightService.temporaryHighlightRequests$,
            videoMetadataRepository.all$
        ]).pipe(
            map(([
                     pronunciationRecords,
                     wordRecognitionRecords,
                     temporaryHighlightRequest,
                     videoMetadata
                 ]) => {
                const strings = [
                    ...Object.keys(pronunciationRecords),
                    ...Object.keys(wordRecognitionRecords),
                    ...videoMetadata.keys()
                ];
                if (temporaryHighlightRequest) {
                    strings.push(temporaryHighlightRequest.word)
                }
                return new SetWithUniqueLengths(strings)
            }),
            shareReplay(1)
        )
    }
}