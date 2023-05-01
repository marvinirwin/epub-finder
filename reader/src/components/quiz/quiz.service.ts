import {BehaviorSubject, combineLatest, Observable, ReplaySubject} from 'rxjs'
import {OpenExampleSentencesFactory} from '../../lib/document-frame/open-example-sentences-document.factory'
import {debounceTime, distinctUntilChanged, map, mapTo, shareReplay, tap} from 'rxjs/operators'
import {QuizCard} from './word-card.interface'
import {orderBy, uniqBy} from 'lodash'
import CardsRepository from '../../lib/manager/cards.repository'
import {ExampleSegmentsService} from '../../lib/quiz/example-segments.service'
import {EXAMPLE_SENTENCE_DOCUMENT, OpenDocumentsService} from '../../lib/manager/open-documents.service'
import {LanguageConfigsService, PossibleTranslationConfig} from '../../lib/language/language-configs.service'
import {FlashCardType} from '../../lib/quiz/hidden-quiz-fields'
import {SettingsService} from '../../services/settings.service'
import {SortedLimitScheduleRowsService,} from '../../lib/manager/sorted-limit-schedule-rows.service'
import {wordCardFactory} from './card-card.factory'
import {TabulationConfigurationService} from '../../lib/language/language-maps/tabulation-configuration.service'
import {TranslationAttemptScheduleService} from '../../lib/schedule/translation-attempt-schedule.service'
import {OnSelectService} from '../../lib/user-interface/on-select.service'
import {WordRecognitionProgressRepository} from '../../lib/schedule/word-recognition-progress.repository'
import {WordRecognitionRow} from '../../lib/schedule/word-recognition-row'
import {getItemsThatDontRepeat} from "./get-items-that-dont-repeat";
import {scheduleRowKey} from "../../lib/util/Util";
import {SpacedScheduleRow} from "../../lib/manager/space-schedule-row.type";
import {DictionaryService} from "../../lib/dictionary/dictionary.service";
import {fetchTranslationWithGrammarHints} from "../../services/translate.service";
import {SegmentSubsequences} from "@shared/*";
import {LoadingService} from "../../lib/loading/loadingService";

type SegmentMapReturnType = {
    segments: SegmentSubsequences[],
    translationConfig: PossibleTranslationConfig
};

export class QuizService {
    quizCard: QuizCard
    currentScheduleRow$: Observable<SpacedScheduleRow | undefined>
    manualHiddenFieldConfig$ = new ReplaySubject<string>()

    constructor(
        {
            cardsRepository,
            sortedLimitedQuizScheduleRowsService,
            exampleSegmentsService,
            openDocumentsService,
            languageConfigsService,
            settingsService,
            tabulationConfigurationService,
            translationAttemptScheduleService,
            onSelectService,
            wordRecognitionProgressRepository,
            dictionaryService,
            loadingService
        }: {
            cardsRepository: CardsRepository
            sortedLimitedQuizScheduleRowsService: SortedLimitScheduleRowsService
            openDocumentsService: OpenDocumentsService
            languageConfigsService: LanguageConfigsService
            settingsService: SettingsService
            tabulationConfigurationService: TabulationConfigurationService
            translationAttemptScheduleService: TranslationAttemptScheduleService
            onSelectService: OnSelectService,
            wordRecognitionProgressRepository: WordRecognitionProgressRepository
            exampleSegmentsService: ExampleSegmentsService
            dictionaryService: DictionaryService,
            loadingService: LoadingService
        }) {
        this.manualHiddenFieldConfig$.next('')
        this.currentScheduleRow$ = combineLatest(
            [
                sortedLimitedQuizScheduleRowsService.sortedLimitedScheduleRows$,
                wordRecognitionProgressRepository.recordList$.pipe(
                    map(recordList => orderBy(recordList, r => r.created_at, 'desc') as WordRecognitionRow[]),
                    shareReplay(1),
                ),
            ],
        ).pipe(
            map(([scheduleRows, previousRecords]) => {
                const firstRow = scheduleRows.limitedScheduleRows[0];
                const previousCardType = previousRecords[0]?.flash_card_type;
                const resolveNoRepeat = () => {
                    /*
                     * TODO make this generic
                     */
                    for (let i = 5; i >= 1; i--) {
                        const itemsThatDontRepeat = new Set(getItemsThatDontRepeat(scheduleRows, previousRecords, i, r => r.word));
                        const itemsWithADifferentFlashCardTypeAsLastTime = new Set(scheduleRows.limitedScheduleRows.filter(r => r.d.flash_card_type !== previousCardType));
                        const filteredWords = scheduleRows.limitedScheduleRows.filter(r => [
                            itemsThatDontRepeat,
                            itemsWithADifferentFlashCardTypeAsLastTime
                        ].every(set => set.has(r)))
                        if (filteredWords.length) {
                            return filteredWords[0];
                        }
                    }
                    for (let i = 5; i >= 1; i--) {
                        const itemsThatDontRepeat = new Set(getItemsThatDontRepeat(scheduleRows, previousRecords, i, r => r.word));
                        const filteredWords = scheduleRows.limitedScheduleRows.filter(r => [
                            itemsThatDontRepeat,
                        ].every(set => set.has(r)))
                        if (filteredWords.length) {
                            return filteredWords[0];
                        }
                    }
                    for (let i = 5; i >= 1; i--) {
                        const itemsWithADifferentFlashCardTypeAsLastTime = new Set(scheduleRows.limitedScheduleRows.filter(r => r.d.flash_card_type !== previousCardType));
                        const filteredWords = scheduleRows.limitedScheduleRows.filter(r => [
                            itemsWithADifferentFlashCardTypeAsLastTime
                        ].every(set => set.has(r)))
                        if (filteredWords.length) {
                            return filteredWords[0];
                        }
                    }
                }
                const itemPreventedRepeat = resolveNoRepeat()
                if (itemPreventedRepeat) {
                    return itemPreventedRepeat
                }
                return firstRow
            }),
        )
        const currentWord$ = this.currentScheduleRow$.pipe(
            map((row) => row?.d.word),
            distinctUntilChanged(),
        )
        const openExampleSentencesDocument = OpenExampleSentencesFactory({
            tabulationConfigurationService,
            settingsService,
            languageConfigsService,
            onSelectService,
            exampleSegmentsService,
            documentId: 'example-sentences',
            loadingService,
            sentences$: combineLatest([
                exampleSegmentsService.exampleSegmentMap$,
                currentWord$,
                languageConfigsService.learningToKnownTranslateConfig$
            ]).pipe(
                debounceTime(0),
                map(
                    ([
                         exampleSegmentMap,
                         currentWord,
                         translationConfig
                     ]): SegmentMapReturnType => {
                        if (!currentWord) return {
                            segments: [],
                            translationConfig
                        } as SegmentMapReturnType;

                        const subSequences = exampleSegmentMap.get(currentWord) || [];
                        return {
                            segments: uniqBy(
                                subSequences,
                                subSequence => subSequence.segmentText,
                            ).slice(0, 10),
                            translationConfig
                        } as SegmentMapReturnType
                    },
                ),
                tap(({segments, translationConfig}) => {
                    // pre fetch translations so the user doesnt have to wait on mouseover
                    if (translationConfig){
                        segments.forEach(exampleSegment => {
                            fetchTranslationWithGrammarHints({
                                to: translationConfig.to as string,
                                from: translationConfig.from as string,
                                text: exampleSegment.segmentText as string,
                            })
                        })
                    }
                }),
                map(( {segments} ) => {
                    return segments
                }),
                shareReplay(1),
            ),
        })
        openDocumentsService.openDocumentTree.appendDelta$.next({
            nodeLabel: 'root',
            children: {
                [EXAMPLE_SENTENCE_DOCUMENT]: {
                    nodeLabel: EXAMPLE_SENTENCE_DOCUMENT,
                    value: openExampleSentencesDocument,
                },
            },
        })

        const wordCard = wordCardFactory(
            currentWord$,
            cardsRepository,
            languageConfigsService,
            dictionaryService
        )

        this.quizCard = {
            ...wordCard,
            flashCardType$: this.currentScheduleRow$.pipe(
                map(scheduleRow => scheduleRow?.d?.flash_card_type || FlashCardType.WordExamplesAndPicture),
                shareReplay(1),
            ),
            answerIsRevealed$: new BehaviorSubject<boolean>(false),
            exampleSentenceOpenDocument: openExampleSentencesDocument,
        }

        this.currentScheduleRow$
            .pipe(distinctUntilChanged(
                    (r1, r2) => {
                        if (!r1 || !r2) return false
                        return scheduleRowKey(r1) === scheduleRowKey(r2)
                    }),
                mapTo(false),
            )
            .subscribe(this.quizCard.answerIsRevealed$)
    }
}
