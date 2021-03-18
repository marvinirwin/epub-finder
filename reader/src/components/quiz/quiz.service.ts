import {BehaviorSubject, combineLatest, Observable, ReplaySubject} from "rxjs";
import {OpenExampleSentencesFactory} from "../../lib/document-frame/open-example-sentences-document.factory";
import {distinctUntilChanged, map, mapTo, shareReplay} from "rxjs/operators";
import {QuizCard} from "./word-card.interface";
import {orderBy, uniq} from "lodash";
import CardsRepository from "src/lib/manager/cards.repository";
import {ExampleSegmentsService} from "../../lib/example-segments.service";
import {EXAMPLE_SENTENCE_DOCUMENT, OpenDocumentsService} from "../../lib/manager/open-documents.service";
import {NormalizedQuizCardScheduleRowData, ScheduleRow} from "../../lib/schedule/schedule-row";
import {LanguageConfigsService} from "../../lib/language-configs.service";
import {hiddenDefinition, hiddenLearningLanguage} from "../../lib/hidden-quiz-fields";
import {SettingsService} from "../../services/settings.service";
import {SortedLimitScheduleRowsService} from "../../lib/manager/sorted-limit-schedule-rows.service";
import {wordCardFactory} from "./card-card.factory";
import {TabulationConfigurationService} from "../../lib/tabulation-configuration.service";
import {sumWordCountRecords} from "../../lib/schedule/schedule-math.service";
import {TranslationAttemptScheduleService} from "../../lib/schedule/translation-attempt-schedule.service";

export const filterQuizRows = (rows: ScheduleRow<NormalizedQuizCardScheduleRowData>[]) => rows
    .filter(r => r.dueDate() < new Date())
    .filter(r => sumWordCountRecords(r) > 0);

export const computeRandomHiddenQuizFields = () => {
    return hiddenDefinition;
    /*
        return Math.random() > 0.5 ?
            hiddenDefinition :
            hiddenLearningLanguage;
    */
};

export class QuizService {
    quizCard: QuizCard;
    currentScheduleRow$: Observable<ScheduleRow<NormalizedQuizCardScheduleRowData>>
    manualHiddenFieldConfig$ = new ReplaySubject<string>();

    constructor(
        {
            cardsRepository,
            sortedLimitedQuizScheduleRowsService,
            exampleSentencesService,
            openDocumentsService,
            languageConfigsService,
            settingsService,
            tabulationConfigurationService,
            translationAttemptScheduleService
        }: {
            cardsRepository: CardsRepository
            sortedLimitedQuizScheduleRowsService: SortedLimitScheduleRowsService,
            exampleSentencesService: ExampleSegmentsService,
            openDocumentsService: OpenDocumentsService,
            languageConfigsService: LanguageConfigsService,
            settingsService: SettingsService,
            tabulationConfigurationService: TabulationConfigurationService
            translationAttemptScheduleService: TranslationAttemptScheduleService
        }
    ) {
        this.manualHiddenFieldConfig$.next('');
        this.currentScheduleRow$ = sortedLimitedQuizScheduleRowsService.sortedLimitedScheduleRows$.pipe(
            map(rows => {
                return rows.limitedScheduleRows[0];
            }),
        );
        const currentWord$ = this.currentScheduleRow$.pipe(map(row => row?.d.word));
        const openExampleSentencesDocument = OpenExampleSentencesFactory(
            {
                tabulationConfigurationService,
                settingsService,
                languageConfigsService,
                name: 'example-sentences',
                sentences$: combineLatest([
                    exampleSentencesService.exampleSegmentMap$,
                    currentWord$,
                    translationAttemptScheduleService.indexedScheduleRows$
                ]).pipe(
                    map(([sentenceMap, currentWord, translationAttemptScheduleIndex]) => {
                        const firstTranslationAttempt = Object.values(translationAttemptScheduleIndex)[0]?.d?.segmentText || '';
                        if (!currentWord) return [];
                        const exampleSegmentTexts = Array.from(sentenceMap.get(currentWord) || new Set<string>());
                        return uniq(
                            orderBy(
                                exampleSegmentTexts,
                                [
                                    segmentText => firstTranslationAttempt.includes(segmentText) ? 1 : 0,
                                    v => v.length,
                                ],
                                [
                                    'desc',
                                    'asc',
                                ]
                            )).slice(0, 10)
                    }),
                    shareReplay(1)
                ),
            }
        );
        openDocumentsService.openDocumentTree.appendDelta$.next({
                nodeLabel: 'root',
                children: {
                    [EXAMPLE_SENTENCE_DOCUMENT]: {
                        nodeLabel: EXAMPLE_SENTENCE_DOCUMENT,
                        value: openExampleSentencesDocument
                    }
                }
            }
        )


        const wordCard = wordCardFactory(
            currentWord$,
            cardsRepository,
            languageConfigsService
        );

        this.quizCard = {
            ...wordCard,
            hiddenFields$: combineLatest([currentWord$.pipe(distinctUntilChanged()), this.manualHiddenFieldConfig$]).pipe(
                map(([, manualFieldConfig]) => {
                    const m = {hiddenDefinition, hiddenLearningLanguage};
                    // @ts-ignore
                    return m[manualFieldConfig] ||
                        computeRandomHiddenQuizFields()
                }),
                shareReplay(1)
            ),
            answerIsRevealed$: new BehaviorSubject<boolean>(false),
            exampleSentenceOpenDocument: openExampleSentencesDocument,
        }

        currentWord$
            .pipe(
                distinctUntilChanged(),
                mapTo(false)
            )
            .subscribe(this.quizCard.answerIsRevealed$)
    }
}