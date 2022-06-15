import {VideoMetadataRepository} from '../../../services/video-metadata.repository'
import CardsRepository from '../../manager/cards.repository'
import {IgnoredWordsRepository} from '../ignored-words.repository'
import {AllWordsRepository} from '../../language/all-words.repository'
import {TranslationAttemptService} from '../../../components/translation-attempt/translation-attempt.service'
import {TimeService} from '../../time/time.service'
import {combineLatest, Observable} from 'rxjs'
import {map, shareReplay} from 'rxjs/operators'
import {mapIfThenDefault} from '../../util/map.module'
import {IPositionedWord} from '../../../../../server/src/shared/annotation/IPositionedWord'
import {CustomWordsRepository} from './custom-words.repository'
import {TabulationService} from '../../tabulation/tabulation.service'
import {pipeLog} from '../../manager/pipe.log'
import {SegmentSubsequences} from "@shared/*";

export const sumNotableSubSequences = (iPositionedWords: SegmentSubsequences) => {
    const m = new Map<string, number>()
    iPositionedWords.subsequences.forEach(({word}) => {
        mapIfThenDefault(m, word, 1, v => v + 1)
    })
    return m
}


export type FlashCardLearningTarget = {
    word: string
}

export const subSequenceRecordHasNothingAdjacent = (notableSubSequences: SegmentSubsequences, notableSubSequence: IPositionedWord) => {
    const positionAfterMe = notableSubSequence.position + notableSubSequence.word.length
    const positionBeforeMe = notableSubSequence.position
    /**
     * This will fail if someone has whitespace before or after their word
     */
    const adjacentRecords = notableSubSequences.subsequences.filter(potentialAdjacentSubSequence => {
        const isInFrontOfMe = potentialAdjacentSubSequence.position + potentialAdjacentSubSequence.word.length === positionBeforeMe
        const isBehindMe = potentialAdjacentSubSequence.position === positionAfterMe
        return isInFrontOfMe || isBehindMe
    })
    return adjacentRecords.length === 0
}

export class FlashCardLearningTargetsService {
    learningTargets$: Observable<Map<string, FlashCardLearningTarget>>

    constructor({
                    ignoredWordsRepository,
                    allWordsRepository,
                    customWordsRepository,
                    tabulationService
                }: {
                    videoMetadataRepository: VideoMetadataRepository,
                    cardsRepository: CardsRepository
                    ignoredWordsRepository: IgnoredWordsRepository
                    allWordsRepository: AllWordsRepository
                    translationAttemptService: TranslationAttemptService
                    timeService: TimeService
                    customWordsRepository: CustomWordsRepository
                    tabulationService: TabulationService
                },
    ) {
        this.learningTargets$ = combineLatest([
            allWordsRepository.all$,
            customWordsRepository.indexOfOrderedRecords$,
            ignoredWordsRepository.latestRecords$,
            tabulationService.tabulation$.pipe(pipeLog("learning-targets:tabulation"))
        ]).pipe(
            map(([
                     builtInWords,
                     customWordsIndex,
                     ignoredWords,
                     tabulation
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
                tabulation.wordCountMap.forEach((values, word) => ensureLearningTargetForWord(word))
                Object.keys(customWordsIndex).forEach(ensureLearningTargetForWord)
                ignoredWords.forEach(
                    ({word}) => learningTargetIndex.delete(word),
                )
                return learningTargetIndex
            }),
            shareReplay(1),
        )
    }
}