import {TemporaryHighlightService} from '../highlighting/temporary-highlight.service'
import {VideoMetadataRepository} from '../../services/video-metadata.repository'
import CardsRepository from '../manager/cards.repository'
import {IgnoredWordsRepository} from '../schedule/ignored-words.repository'
import {AllWordsRepository} from '../language/all-words.repository'
import {TranslationAttemptService} from '../../components/translation-attempt/translation-attempt.service'
import {SelectedVirtualTabulationsService} from '../manager/selected-virtual-tabulations.service'
import {TimeService} from '../time/time.service'
import {LanguageConfigsService} from '../language/language-configs.service'
import {combineLatest, Observable} from 'rxjs'
import {map, shareReplay, startWith} from 'rxjs/operators'
import {SerializedTabulationAggregate} from '../../../../server/src/shared/tabulation/serialized-tabulation.aggregate'
import {sumNotableSubSequences,} from '../schedule/learning-target/flash-card-learning-targets.service'
import {DocumentWordCount} from '../../../../server/src/shared/DocumentWordCount'
import {safePushMap} from '@shared/'
import {pipeLog} from '../manager/pipe.log'
import {getNotableSubsequencesOfWords} from "./get-notable-subsequences-of-words";
import {combineSegmentSubSequences} from "./combine-segment-subsequences";

export class TabulationService {
    tabulation$: Observable<{ wordCountMap: Map<string, DocumentWordCount[]> }>
    constructor(
        {
            videoMetadataRepository,
            ignoredWordsRepository,
            allWordsRepository,
            selectedVirtualTabulationsService,
            languageConfigsService,
        }: {
            temporaryHighlightService: TemporaryHighlightService,
            videoMetadataRepository: VideoMetadataRepository,
            cardsRepository: CardsRepository
            ignoredWordsRepository: IgnoredWordsRepository
            allWordsRepository: AllWordsRepository
            translationAttemptService: TranslationAttemptService
            selectedVirtualTabulationsService: SelectedVirtualTabulationsService
            timeService: TimeService
            languageConfigsService: LanguageConfigsService
        }) {
        this.tabulation$ = combineLatest([
            allWordsRepository.all$.pipe(pipeLog('tabulation:allWords')),
            selectedVirtualTabulationsService.selectedFrequencyVirtualTabulations$.pipe(pipeLog("tabulation:selected-virtual-tabulations")),
            videoMetadataRepository.all$.pipe(startWith(new Map())),
            languageConfigsService.wordSeparationStrategy$.pipe(pipeLog('tabulation:wordSeparationStrategy')),
        ]).pipe(
            map(([
                     builtInWords,
                     selectedFrequencyVirtualTabulations,
                     videoMetadataIndex,
                     strategy,
                 ]) => {
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
                const vocabulary = new Set(builtInWords);
                const wordCountMap = new Map<string, DocumentWordCount[]>();
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
                            combineSegmentSubSequences(notableSubSequences.map(notableSubSequence => getNotableSubsequencesOfWords(notableSubSequence, syntheticWords, strategy, vocabulary)))
                            ,
                        );
                        documentWordCounts.forEach(
                            (count, word) => {
                                /**
                                 * Prevent cards created only for visual purposes from showing up in the quiz rows
                                 */
                                if (!syntheticWords.has(word)) {
                                    // TODO, provide the document name
                                    safePushMap(wordCountMap, word, {
                                        count,
                                        word,
                                        document: '',
                                    })
                                }
                            },
                        )
                    },
                )
                return {
                    wordCountMap
                }
            }),
            shareReplay(1),
        )
    }
}