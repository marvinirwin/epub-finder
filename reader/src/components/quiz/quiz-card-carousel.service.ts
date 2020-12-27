import {combineLatest, Observable, Subject} from "rxjs";
import {ScheduleRow} from "../../lib/schedule/schedule-row.interface";
import {OpenDocument} from "../../lib/DocumentFrame/open-document.entity";
import {TrieWrapper} from "../../lib/TrieWrapper";
import {AtomizedDocument} from "../../lib/Atomized/AtomizedDocument";
import {DocumentSourcesService} from "../../lib/DocumentFrame/document-sources.service";
import {OpenExampleSentencesFactory} from "../../lib/DocumentFrame/open-example-sentences-document.factory";
import {map, shareReplay} from "rxjs/operators";
import {InterpolateExampleSentencesService} from "../example-sentences/interpolate-example-sentences.service";
import {QuizCard} from "./quiz-card.interface";
import {EditableValue} from "./editing-value";
import {Dictionary} from "lodash";
import {ICard} from "../../lib/Interfaces/ICard";
import CardService from "src/lib/Manager/CardService";
import {resolveICardForWordLatest} from "../../lib/Pipes/ResolveICardForWord";

export class QuizCardCarouselService {
    quizCard: QuizCard;
    constructor(
        {
            currentScheduleRow$,
            exampleSentencesMap$,
            trie$,
            cardService
        }: {
            currentScheduleRow$: Observable<ScheduleRow | undefined>,
            exampleSentencesMap$: Observable<Map<string, string[]>>,
            trie$: Observable<TrieWrapper>,
            cardService: CardService
        }
        ) {
        const currentWord$ = currentScheduleRow$.pipe(map(row => row?.word));
        const openExampleSentencesDocument = OpenExampleSentencesFactory(
            'example-sentences',
            combineLatest([
                exampleSentencesMap$,
                currentWord$
            ]).pipe(
                map(([sentenceMap, currentWord]) => {
                    if (!currentWord) return [];
                    return sentenceMap.get(currentWord) || []
                }),
                shareReplay(1)
            ),
            trie$
        );

        this.quizCard = {
            exampleSentenceOpenDocument: openExampleSentencesDocument,
            word$: currentWord$,
            image$: new EditableValue<string | undefined>(
                resolveICardForWordLatest(cardService.cardIndex$, currentWord$).pipe(map(c => c?.photos?.[0])),
                v => {
                // TODO Persist here or something
            }),
            description$: new EditableValue<string | undefined>(
                resolveICardForWordLatest(cardService.cardIndex$, currentWord$).pipe(map(c => c?.knownLanguage?.[0])),
                v => {
                // TODO persist here or something
            }),
        }
    }
}