import {combineLatest, Observable, Subject} from "rxjs";
import {ScheduleRow} from "../../lib/schedule/schedule-row.interface";
import {OpenDocument} from "../../lib/DocumentFrame/open-document.entity";
import {TrieWrapper} from "../../lib/TrieWrapper";
import {AtomizedDocument} from "../../lib/Atomized/AtomizedDocument";
import {DocumentSourcesService} from "../../lib/DocumentFrame/document-sources.service";
import {OpenExampleSentencesFactory} from "../../lib/DocumentFrame/open-example-sentences-document.factory";
import {catchError, map, shareReplay} from "rxjs/operators";
import {InterpolateExampleSentencesService} from "../example-sentences/interpolate-example-sentences.service";
import {QuizCard} from "./quiz-card.interface";
import {EditableValue} from "./editing-value";
import {Dictionary, uniq} from "lodash";
import {ICard} from "../../lib/Interfaces/ICard";
import CardService from "src/lib/Manager/CardService";
import {resolveICardForWordLatest} from "../../lib/Pipes/ResolveICardForWord";
import {ScheduleService} from "../../lib/Manager/schedule.service";
import {ExampleSentencesService} from "../../lib/example-sentences.service";

export class QuizCardCarouselService {
    quizCard: QuizCard;

    constructor(
        {
            trie$,
            cardService,
            scheduleService,
            exampleSentencesService
        }: {
            trie$: Observable<TrieWrapper>,
            cardService: CardService
            scheduleService: ScheduleService,
            exampleSentencesService: ExampleSentencesService
        }
    ) {
        const currentScheduleRow$ = scheduleService.sortedScheduleRows$.pipe(
            map(rows => rows[0]),
        );
        const currentWord$ = currentScheduleRow$.pipe(map(row => row?.word));
        const openExampleSentencesDocument = OpenExampleSentencesFactory(
            'example-sentences',
            combineLatest([
                exampleSentencesService.exampleSentenceMap$,
                currentWord$
            ]).pipe(
                map(([sentenceMap, currentWord]) => {
                    if (!currentWord) return [];
                    return uniq((sentenceMap.get(currentWord) || []).map(a => a.translatableText)).slice(0, 10)
                }),
                shareReplay(1)
            ),
            trie$
        );

        this.quizCard = {
            exampleSentenceOpenDocument: openExampleSentencesDocument,
            word$: currentWord$,
            image$: new EditableValue<string | undefined>(
                resolveICardForWordLatest(cardService.cardIndex$, currentWord$)
                    .pipe(
                        map(c => c?.photos?.[0]),
                        shareReplay(1),
                    ),
                v => {
                    // TODO Persist here or something
                }),
            description$: new EditableValue<string | undefined>(
                resolveICardForWordLatest(cardService.cardIndex$, currentWord$)
                    .pipe(
                        map(c => c?.knownLanguage?.[0]),
                        shareReplay(1)
                    ),
                v => {
                    // TODO persist here or something
                }),
        }
    }
}