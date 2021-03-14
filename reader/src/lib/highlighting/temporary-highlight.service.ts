import {ReplaySubject} from "rxjs";
import {RGBA} from "./color.service";
import {HighlighterService} from "./highlighter.service";
import {filter, map} from "rxjs/operators";
import CardsRepository from "../manager/cards.repository";
import {sleep} from "../util/Util";
import {isChineseCharacter} from "../../../../server/src/shared/OldAnkiClasses/Card";

export function removePunctuation(withPunctuation: string) {
    return withPunctuation.split('').filter(c => {
        return isChineseCharacter(c) && !punctuation.has(c);
    }).join('');
}

export type TemporaryHighlightRequest = { word: string, color: RGBA, duration: number };

export class TemporaryHighlightService {
    public temporaryHighlightRequests$ = new ReplaySubject< TemporaryHighlightRequest | undefined >(1)
    private cardService: CardsRepository;

    constructor(
        {
            highlighterService,
            cardService
        }: {
            highlighterService: HighlighterService,
            cardService: CardsRepository
        }
    ) {
        this.cardService = cardService;
        highlighterService.timedHighlight(
            this.temporaryHighlightRequests$.pipe(
                // @ts-ignore
                filter((v: TemporaryHighlightRequest | undefined) => v !== undefined),
                map(({color, word, duration}: TemporaryHighlightRequest) =>
                    (
                        {
                            timeout: duration,
                            delta: HighlighterService.wordToMap(color)(word)
                        }
                    )
                )
            ),
            highlighterService.highlightMap$,
            [0, "TEMPORARY_HIGHLIGHT"] // This is a hack, this should be dynamic
            // so as many people can temp highlight as they want.
            // The highlight services need to be split up and done nicer
        )
    }

    public async highlightTemporaryWord(word: string, color: RGBA, duration: number) {
        this.temporaryHighlightRequests$.next({word, color, duration});
        await sleep(duration);
        // This is gonna fail if there's two temporary highlight requests
        this.temporaryHighlightRequests$.next(undefined);
    }
}

const punctuation = new Set(['。',',','！'])