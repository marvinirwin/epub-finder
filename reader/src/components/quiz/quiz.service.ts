import {BehaviorSubject, combineLatest, merge, Observable, of, ReplaySubject} from "rxjs";
import {TrieWrapper} from "../../lib/TrieWrapper";
import {OpenExampleSentencesFactory} from "../../lib/document-frame/open-example-sentences-document.factory";
import {debounceTime, distinctUntilChanged, map, mapTo, shareReplay, switchMap, withLatestFrom} from "rxjs/operators";
import {QuizCard} from "./quiz-card.interface";
import {EditableValue} from "./editing-value";
import {uniq} from "lodash";
import CardsRepository from "src/lib/manager/cards.repository";
import {resolveICardForWordLatest} from "../../lib/pipes/ResolveICardForWord";
import {ScheduleService} from "../../lib/manager/schedule.service";
import {ExampleSegmentsService} from "../../lib/example-segments.service";
import {EXAMPLE_SENTENCE_DOCUMENT, OpenDocumentsService} from "../../lib/manager/open-documents.service";
import {ICard} from "../../../../server/src/shared/ICard";
import {NormalizedScheduleRowData} from "../../lib/schedule/schedule-row.interface";
import {ScheduleRow} from "../../lib/schedule/ScheduleRow";
import {LanguageConfigsService} from "../../lib/language-configs.service";
import {hiddenLearningLanguage, hiddenDefinition} from "../../../../server/src/shared/hidden-quiz-fields";
import {workerData} from "worker_threads";

export const filterQuizRows = (rows: ScheduleRow<NormalizedScheduleRowData>[]) => rows
    .filter(r => r.dueDate() < new Date())
    .filter(r => r.count() > 0);

export const computeRandomHiddenQuizFields = () => Math.random() > 0.5 ? hiddenDefinition : hiddenLearningLanguage;

export class QuizService {
    quizCard: QuizCard;
    currentScheduleRow$: Observable<ScheduleRow<NormalizedScheduleRowData>>
    manualHiddenFieldConfig$ = new ReplaySubject<string>();

    constructor(
        {
            trie$,
            cardService,
            scheduleService,
            exampleSentencesService,
            openDocumentsService,
            languageConfigsService
        }: {
            trie$: Observable<TrieWrapper>,
            cardService: CardsRepository
            scheduleService: ScheduleService,
            exampleSentencesService: ExampleSegmentsService,
            openDocumentsService: OpenDocumentsService,
            languageConfigsService: LanguageConfigsService
        }
    ) {
        this.currentScheduleRow$ = scheduleService.sortedScheduleRows$.pipe(
            map(rows => filterQuizRows(rows)[0]),
        );
        const currentWord$ = this.currentScheduleRow$.pipe(map(row => row?.d.word));
        const openExampleSentencesDocument = OpenExampleSentencesFactory(
            'example-sentences',
            combineLatest([
                exampleSentencesService.exampleSegmentMap$,
                currentWord$
            ]).pipe(
                map(([sentenceMap, currentWord]) => {
                    if (!currentWord) return [];
                    const wordSet = Array.from(sentenceMap.get(currentWord) || new Set<string>());
                    return uniq(wordSet.map(a => a)).slice(0, 10)
                }),
                shareReplay(1)
            ),
            trie$
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

        function update(propsToUpdate: Partial<ICard>, word: string) {
            cardService.updateICard(
                word,
                propsToUpdate
            )
        }

        this.quizCard = {
            exampleSentenceOpenDocument: openExampleSentencesDocument,
            word$: currentWord$,
            image$: new EditableValue<string | undefined>(
                resolveICardForWordLatest(cardService.cardIndex$, currentWord$)
                    .pipe(
                        distinctUntilChanged(),
                        map(c => {
                            return c?.photos?.[0];
                        }),
                        shareReplay(1),
                    ),
                imageSrc$ => imageSrc$
                    .pipe(
                        withLatestFrom(currentWord$),
                        debounceTime(1000),
                    ).subscribe(([imageSrc, word]) => update({photos: [imageSrc || '']}, word))
            ),
            description$: new EditableValue<string | undefined>(
                resolveICardForWordLatest(cardService.cardIndex$, currentWord$)
                    .pipe(
                        map(c => c?.knownLanguage?.[0]),
                        shareReplay(1)
                    ),
                description$ =>
                    description$.pipe(
                        withLatestFrom(currentWord$),
                        debounceTime(1000)
                    ).subscribe(([description, word]) => {
                        update({knownLanguage: [description || '']}, word)
                    })
            ),
            romanization$: combineLatest([
                languageConfigsService.learningToLatinTransliterateFn$,
                currentWord$
            ]).pipe(
                switchMap((
                    [transliterateFn, currentWord]
                ) => transliterateFn ? transliterateFn(currentWord) : of(undefined))
            ),
            translation$: combineLatest([
                languageConfigsService.learningToKnownTranslateFn$,
                currentWord$
            ]).pipe(
                switchMap(
                    ([translateFn, currentWord]) =>
                        translateFn ? translateFn(currentWord) : of(undefined)
                )
            ),
            // I should make "hidden" deterministic somehow
            // I'll worry about that later
            hiddenFields$: combineLatest([currentWord$, this.manualHiddenFieldConfig$]).pipe(
                map(([word, manualFieldConfig]) => {
                    const m = { hiddenDefinition, hiddenLearningLanguage };
                    // @ts-ignore
                    return m[manualFieldConfig] ||
                        computeRandomHiddenQuizFields()
                })
            ),
            answerIsRevealed$: new BehaviorSubject<boolean>(false)
        }

        currentWord$
            .pipe(
                distinctUntilChanged(),
                mapTo(false)
            )
            .subscribe(this.quizCard.answerIsRevealed$)
    }
}