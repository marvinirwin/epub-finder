import {PronunciationProgressRepository} from "../schedule/pronunciation-progress.repository";
import {WordRecognitionProgressRepository} from "../schedule/word-recognition-progress.repository";
import {SetWithUniqueLengths} from "../../../../server/src/shared/tabulate-documents/set-with-unique-lengths";
import {combineLatest, Observable} from "rxjs";
import {map, shareReplay, startWith} from "rxjs/operators";
import {TemporaryHighlightService} from "../highlighting/temporary-highlight.service";
import {VideoMetadataRepository} from "../../services/video-metadata.repository";
import {WordsService} from "../language/words.service";

export class NotableSubsequencesService {
    notableSubsequenceSet$: Observable<SetWithUniqueLengths>

    constructor(
        {
            pronunciationProgressService,
            wordRecognitionProgressService,
            temporaryHighlightService,
            videoMetadataRepository,
            wordsService
        }: {
            pronunciationProgressService: PronunciationProgressRepository;
            wordRecognitionProgressService: WordRecognitionProgressRepository;
            temporaryHighlightService: TemporaryHighlightService;
            videoMetadataRepository: VideoMetadataRepository;
            wordsService: WordsService
        }
    ) {
        this.notableSubsequenceSet$ = combineLatest([
            pronunciationProgressService.indexOfOrderedRecords$,
            wordRecognitionProgressService.indexOfOrderedRecords$,
            temporaryHighlightService.temporaryHighlightRequests$
                .pipe(startWith(undefined)),
            videoMetadataRepository.all$,
            wordsService.words$,
        ]).pipe(
            map(([
                     pronunciationRecords,
                     wordRecognitionRecords,
                     temporaryHighlightRequest,
                     videoMetadata,
                     words
                 ]) => {
                const strings = [
                    ...Object.keys(pronunciationRecords),
                    ...Object.keys(wordRecognitionRecords),
                    ...videoMetadata.keys(),
                    ...words.values()
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