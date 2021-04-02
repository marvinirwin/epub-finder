import { IndexedRowsRepository } from '../indexed-rows.repository'
import { WordRecognitionRow } from '../word-recognition-row'
import { PronunciationProgressRepository } from '../pronunciation-progress.repository'
import { TemporaryHighlightService } from '../../highlighting/temporary-highlight.service'
import { VideoMetadataRepository } from '../../../services/video-metadata.repository'
import CardsRepository from '../../manager/cards.repository'
import { IgnoredWordsRepository } from '../ignored-words.repository'
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
import { LanguageConfigsService } from '../../language/language-configs.service'

export const sumNotableSubSequences = (iPositionedWords: IPositionedWord[]) => {
    const m = new Map<string, number>()
    iPositionedWords.forEach(value => {
        mapIfThenDefault(m, value.word, 1, v => v + 1)
    })
    return m
}


export type FlashCardLearningTarget = {
    wordCountRecords: DocumentWordCount[]
    greedyWordCountRecords: DocumentWordCount[]
    wordRecognitionRecords: WordRecognitionRow[]
    pronunciationRecords: PronunciationProgressRow[]
    word: string
}

function subSequenceRecordHasNothingAdjacent(notableSubSequences: IPositionedWord[], notableSubSequence: IPositionedWord) {
    const positionAfterMe = notableSubSequence.position + notableSubSequence.word.length
    const positionBeforeMe = notableSubSequence.position
    /**
     * This will fail if someone has whitespace before or after their word
     */
    const adjacentRecords = notableSubSequences.filter(potentialAdjacentSubSequence => {
        const isInFrontOfMe = potentialAdjacentSubSequence.position + potentialAdjacentSubSequence.word.length === positionBeforeMe;
        const isBehindMe = potentialAdjacentSubSequence.position === positionAfterMe;
        return isInFrontOfMe || isBehindMe;
    });
    return adjacentRecords.length === 0;
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
                    languageConfigsService,
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
                    languageConfigsService: LanguageConfigsService
                },
    ) {
        this.learningTargets$ = combineLatest([
            combineLatest([
                    allWordsRepository.all$,
                    selectedVirtualTabulationsService.selectedFrequencyVirtualTabulations$,
                    ignoredWordsRepository.latestRecords$,
                    videoMetadataRepository.all$.pipe(startWith(new Map())),
                    temporaryHighlightService.temporaryHighlightRequests$.pipe(startWith(undefined)),
                ],
            ),
            combineLatest([
                wordRecognitionProgressService.indexOfOrderedRecords$.pipe(
                    startWith({}),
                ),
                pronunciationProgressService.indexOfOrderedRecords$.pipe(startWith({})),
            ]),
            languageConfigsService.strategy$,
        ]).pipe(
            map(([
                     [builtInWords,
                         selectedFrequencyVirtualTabulations,
                         ignoredWords,
                         videoMetadataIndex,
                         temporaryHighlightedWord,
                     ],
                     [wordRecognitionRows, pronunciationRows],
                     strategy,
                 ]) => {
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
                builtInWords.forEach(word => ensureLearningTargetForWord(word))
                const vocabulary = new Set(builtInWords)

                Object.entries(wordRecognitionRows).forEach(
                    ([word, wordRecognitionRecords]) => {
                        vocabulary.add(word)
                        learningTargetIndex.get(word)?.wordRecognitionRecords.push(
                            ...wordRecognitionRecords,
                        )
                    },
                )

                new SerializedTabulationAggregate(
                    selectedFrequencyVirtualTabulations,
                ).serializedTabulations.forEach(
                    ({ notableSubSequences }) => {
                        /**
                         * In the case of noSeparator, use only the subsequences which are part of our vocabulary
                         *   What is our vocabulary?  It's allWords + all the non-ignored recognition rows from our past
                         * In the case of spaceSeparator, use only the subsequences which are part of our vocabulary, or are bordered on either side by separators
                         *   How do we tell if something is bordered on either side?  If it has no notable subsequences which immediately border it
                         */
                        const documentWordCounts = sumNotableSubSequences(
                            notableSubSequences
                                .filter((notableSubSequence, subSequenceIndex) => {
                                    if (syntheticWords.has(notableSubSequence.word)) {
                                        return false
                                    }
                                    switch (strategy) {
                                        case "noSeparator":
                                            return vocabulary.has(notableSubSequence.word)
                                        case "spaceSeparator":
                                            return vocabulary.has(notableSubSequence.word) ||
                                                subSequenceRecordHasNothingAdjacent(notableSubSequences, notableSubSequence)
                                    }
                                }),
                        )
                        documentWordCounts.forEach(
                            (count, word) => {
                                /**
                                 * Prevent cards created only for visual purposes from showing up in the quiz rows
                                 */
                                if (!syntheticWords.has(word)) {
                                    // TODO, provide the document name
                                    ensureLearningTargetForWord(word).wordCountRecords.push({
                                        count,
                                        word,
                                        document: '',
                                    })
                                }
                            },
                        )
                    },
                )
                ignoredWords.forEach(
                    ({ word }) => learningTargetIndex.delete(word),
                )
                return learningTargetIndex
            }),
            shareReplay(1),
        )
    }
}