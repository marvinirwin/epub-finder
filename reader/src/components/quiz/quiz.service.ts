import {combineLatest, Observable} from "rxjs";
import {TrieWrapper} from "../../lib/TrieWrapper";
import {OpenExampleSentencesFactory} from "../../lib/document-frame/open-example-sentences-document.factory";
import {distinctUntilChanged, map, shareReplay, tap} from "rxjs/operators";
import {QuizCard} from "./quiz-card.interface";
import {EditableValue} from "./editing-value";
import {uniq} from "lodash";
import CardsRepository from "src/lib/manager/cards.repository";
import {resolveICardForWordLatest} from "../../lib/pipes/ResolveICardForWord";
import {ScheduleService} from "../../lib/manager/schedule.service";
import {ExampleSegmentsService} from "../../lib/example-segments.service";
import {EXAMPLE_SENTENCE_DOCUMENT, OpenDocumentsService} from "../../lib/manager/open-documents.service";
import {observableLastValue} from "../../services/settings.service";
import {ICard} from "../../../../server/src/shared/ICard";
import {NormalizedScheduleRowData} from "../../lib/schedule/schedule-row.interface";
import {ScheduleRow} from "../../lib/schedule/ScheduleRow";

export const filterQuizRows = (rows: ScheduleRow<NormalizedScheduleRowData>[]) => rows
    .filter(r => r.dueDate() < new Date())
    .filter(r => r.count() > 0);

export class QuizService {
    quizCard: QuizCard;
    currentScheduleRow$: Observable<ScheduleRow<NormalizedScheduleRowData>>

    constructor(
        {
            trie$,
            cardService,
            scheduleService,
            exampleSentencesService,
            openDocumentsService
        }: {
            trie$: Observable<TrieWrapper>,
            cardService: CardsRepository
            scheduleService: ScheduleService,
            exampleSentencesService: ExampleSegmentsService,
            openDocumentsService: OpenDocumentsService
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

        function update(propsToUpdate: Partial<ICard>) {
            observableLastValue(currentWord$)
                .then(word => {
                    cardService.updateICard(
                        word,
                        propsToUpdate
                    )
                })
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
                imageSrc => {
                    update({photos: [imageSrc || '']});
                }),
            description$: new EditableValue<string | undefined>(
                resolveICardForWordLatest(cardService.cardIndex$, currentWord$)
                    .pipe(
                        map(c => c?.knownLanguage?.[0]),
                        shareReplay(1)
                    ),
                description => {
                    update({knownLanguage: [description || '']});
                }),
        }
    }
}