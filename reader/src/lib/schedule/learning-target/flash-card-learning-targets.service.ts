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
import { map, shareReplay } from 'rxjs/operators'
import { mapIfThenDefault } from '../../util/map.module'
import { IPositionedWord } from '../../../../../server/src/shared/Annotation/IPositionedWord'
import { LanguageConfigsService } from '../../language/language-configs.service'
import { CustomWordsRepository } from './custom-words.repository'

export const sumNotableSubSequences = (iPositionedWords: IPositionedWord[]) => {
    const m = new Map<string, number>()
    iPositionedWords.forEach(value => {
        mapIfThenDefault(m, value.word, 1, v => v + 1)
    })
    return m
}


export type FlashCardLearningTarget = {
    word: string
}

export const subSequenceRecordHasNothingAdjacent = (notableSubSequences: IPositionedWord[], notableSubSequence: IPositionedWord) => {
    const positionAfterMe = notableSubSequence.position + notableSubSequence.word.length
    const positionBeforeMe = notableSubSequence.position
    /**
     * This will fail if someone has whitespace before or after their word
     */
    const adjacentRecords = notableSubSequences.filter(potentialAdjacentSubSequence => {
        const isInFrontOfMe = potentialAdjacentSubSequence.position + potentialAdjacentSubSequence.word.length === positionBeforeMe
        const isBehindMe = potentialAdjacentSubSequence.position === positionAfterMe
        return isInFrontOfMe || isBehindMe
    })
    return adjacentRecords.length === 0
}

export class FlashCardLearningTargetsService {
    learningTargets$: Observable<Map<string, FlashCardLearningTarget>>

    constructor({
                    wordRecognitionProgressService,
                    temporaryHighlightService,
                    videoMetadataRepository,
                    ignoredWordsRepository,
                    allWordsRepository,
                    selectedVirtualTabulationsService,
                    languageConfigsService,
                    customWordsRepository,
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
                    customWordsRepository: CustomWordsRepository
                },
    ) {
        this.learningTargets$ = combineLatest([
            allWordsRepository.all$,
            ignoredWordsRepository.latestRecords$,
            customWordsRepository.indexOfOrderedRecords$,
        ]).pipe(
            map(([
                     builtInWords,
                     ignoredWords,
                     customWordsIndex,
                 ]) => {
                const learningTargetIndex: Map<string, FlashCardLearningTarget> = new Map()
                /**
                 * This will break once there are real words with the same strings as the video metadata
                 * Same with temporary highlights :/
                 */
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
                            word,
                        },
                    )
                }
                builtInWords.forEach(ensureLearningTargetForWord)
                Object.keys(customWordsIndex).forEach(ensureLearningTargetForWord)
                ignoredWords.forEach(
                    ({ word }) => learningTargetIndex.delete(word),
                )
                return learningTargetIndex
            }),
            shareReplay(1),
        )
    }
}