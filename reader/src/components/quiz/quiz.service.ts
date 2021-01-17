import {combineLatest, Observable} from "rxjs";
import {TrieWrapper} from "../../lib/TrieWrapper";
import {OpenExampleSentencesFactory} from "../../lib/DocumentFrame/open-example-sentences-document.factory";
import {distinctUntilChanged, map, shareReplay, tap} from "rxjs/operators";
import {QuizCard} from "./quiz-card.interface";
import {EditableValue} from "./editing-value";
import {uniq} from "lodash";
import CardsRepositoryService from "src/lib/Manager/cards.repository.service";
import {resolveICardForWordLatest} from "../../lib/Pipes/ResolveICardForWord";
import {ScheduleService} from "../../lib/Manager/schedule.service";
import {ExampleSegmentsService} from "../../lib/example-segments.service";
import {EXAMPLE_SENTENCE_DOCUMENT, OpenDocumentsService} from "../../lib/Manager/open-documents.service";
import {observableLastValue} from "../../services/settings.service";
import {ICard} from "../../lib/Interfaces/ICard";

export class QuizService {
    quizCard: QuizCard;

    constructor(
        {
            trie$,
            cardService,
            scheduleService,
            exampleSentencesService,
            openDocumentsService
        }: {
            trie$: Observable<TrieWrapper>,
            cardService: CardsRepositoryService
            scheduleService: ScheduleService,
            exampleSentencesService: ExampleSegmentsService,
            openDocumentsService: OpenDocumentsService
        }
    ) {
        const currentScheduleRow$ = scheduleService.sortedScheduleRows$.pipe(
            map(rows => rows[0]),
        );
        const currentWord$ = currentScheduleRow$.pipe(map(row => row?.word));
        const openExampleSentencesDocument = OpenExampleSentencesFactory(
            'example-sentences',
            combineLatest([
                exampleSentencesService.exampleSegmentMap$,
                currentWord$
            ]).pipe(
                map(([sentenceMap, currentWord]) => {
                    if (!currentWord) return [];
                    if (sentenceMap.size) {
                        debugger;console.log()
                    }
                    return uniq((sentenceMap.get(currentWord) || []).map(a => a.translatableText)).slice(0, 10)
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
                            debugger;
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