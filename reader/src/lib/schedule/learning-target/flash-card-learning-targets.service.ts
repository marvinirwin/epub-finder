import { IndexedRowsRepository } from '../indexed-rows.repository'
import { WordRecognitionRow } from '../word-recognition-row'
import { PronunciationProgressRepository } from '../pronunciation-progress.repository'
import { TemporaryHighlightService } from '../../highlighting/temporary-highlight.service'
import { VideoMetadataRepository } from '../../../services/video-metadata.repository'
import CardsRepository from '../../manager/cards.repository'
import { IgnoredWordsRepository } from '../ignored-words.repository'
import { SettingsService } from '../../../services/settings.service'
import { AllWordsRepository } from '../../language/all-words.repository'
import { TranslationAttemptService } from '../../../components/translation-attempt/translation-attempt.service'
import { SelectedVirtualTabulationsService } from '../../manager/selected-virtual-tabulations.service'
import { TimeService } from '../../time/time.service'
import { combineLatest, Observable } from 'rxjs'
import { map, shareReplay, startWith } from 'rxjs/operators'
import { DocumentWordCount } from '../../../../../server/src/shared/DocumentWordCount'
import { PronunciationProgressRow } from '../pronunciation-progress-row.interface'
import { mapIfThenDefault } from '../../util/map.module'
import { SerializedTabulationAggregate } from '../../../../../server/src/shared/tabulation/serialized-tabulation.aggregate'
import { IPositionedWord } from '../../../../../server/src/shared/Annotation/IPositionedWord'

export const sumNotableSubSequences = (iPositionedWords: IPositionedWord[]) => {
    const m = new Map<string, number>();
    iPositionedWords.forEach(value => {
        mapIfThenDefault(m, value.word, 1, v => v + 1)
    })
    return m;
}


export type FlashCardLearningTarget = {
    wordCountRecords: DocumentWordCount[]
    greedyWordCountRecords: DocumentWordCount[]
    wordRecognitionRecords: WordRecognitionRow[]
    pronunciationRecords: PronunciationProgressRow[]
    word: string
}

export class FlashCardLearningTargetsService {
    learningTargets$: Observable<Map<string, FlashCardLearningTarget>>

    constructor({
                    wordRecognitionProgressService,
                    temporaryHighlightService,
                    pronunciationProgressService,
                    videoMetadataRepository,
                    ignoredWordsRepository,
                    allWordsRepository,
                    translationAttemptService,
                    selectedVirtualTabulationsService,
                    timeService,
                }: {
                    wordRecognitionProgressService: IndexedRowsRepository<WordRecognitionRow>
                    pronunciationProgressService: PronunciationProgressRepository
                    temporaryHighlightService: TemporaryHighlightService,
                    videoMetadataRepository: VideoMetadataRepository,
                    cardsRepository: CardsRepository
                    ignoredWordsRepository: IgnoredWordsRepository
                    allWordsRepository: AllWordsRepository
                    translationAttemptService: TranslationAttemptService
                    selectedVirtualTabulationsService: SelectedVirtualTabulationsService
                    timeService: TimeService
                },
    ) {
        this.learningTargets$ = combineLatest([
            allWordsRepository.all$,
            selectedVirtualTabulationsService.selectedFrequencyVirtualTabulations$,
            ignoredWordsRepository.latestRecords$,
            videoMetadataRepository.all$.pipe(startWith(new Map())),
            temporaryHighlightService.temporaryHighlightRequests$.pipe(startWith(undefined)),
            combineLatest([
                wordRecognitionProgressService.indexOfOrderedRecords$.pipe(
                    startWith({}),
                ),
                pronunciationProgressService.indexOfOrderedRecords$.pipe(startWith({})),
            ]),
        ]).pipe(
            map(([allWords, selectedFrequencyVirtualTabulations, ignoredWords, videoMetadataIndex, temporaryHighlightedWord, [wordRecognitionRows, pronunciationRows]]) => {
                const learningTargetIndex: Map<string, FlashCardLearningTarget> = new Map()
                /**
                 * This will break once there are real words with the same strings as the video metadata
                 * Same with temporary highlights :/
                 */
                const syntheticWords = new Set<string>(Object.keys(videoMetadataIndex))
                /*
                    if (temporaryHighlightRequest?.word) {
                        syntheticWords.add(temporaryHighlightRequest?.word);
                    }
                */
                const ensureLearningTargetForWord = (word: string) => {
                    return mapIfThenDefault(
                        learningTargetIndex,
                        word,
                        {
                            wordCountRecords: [],
                            word,
                            wordRecognitionRecords: [],
                            pronunciationRecords: [],
                            greedyWordCountRecords: [],
                        },
                    )
                }
                allWords.forEach(word => ensureLearningTargetForWord(word));
                new SerializedTabulationAggregate(
                    selectedFrequencyVirtualTabulations,
                ).serializedTabulations.forEach(
                    ({ notableSubSequences }) => {
                        /**
                         * Prevent cards created only for visual purposes from showing up in the quiz rows
                         */
                        const documentWordCounts = sumNotableSubSequences(notableSubSequences);
                        documentWordCounts.forEach(
                            (count, word) => {
                                if (!syntheticWords.has(word)) {
                                    // TODO, provide the document name
                                    ensureLearningTargetForWord(word).wordCountRecords.push({count, word, document: ''})
                                }
                            },
                        )
                    },
                );
                Object.entries(wordRecognitionRows).forEach(
                    ([word, wordRecognitionRecords]) => {
                        learningTargetIndex.get(word)?.wordRecognitionRecords.push(
                            ...wordRecognitionRecords,
                        )
                    },
                );
                ignoredWords.forEach(
                    ({ word }) => learningTargetIndex.delete(word)
                )
                return learningTargetIndex;
            }),
            shareReplay(1),
        )
    }
}