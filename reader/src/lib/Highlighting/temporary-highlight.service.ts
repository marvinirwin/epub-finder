import {Observable, ReplaySubject} from "rxjs";
import {RGBA} from "./color.service";
import {HighlighterService} from "./highlighter.service";
import {map} from "rxjs/operators";
import CardService from "../Manager/CardService";
import {sleep} from "../Util/Util";

export class TemporaryHighlightService {
    private temporaryHighlightRequests$ = new ReplaySubject<{ word: string, color: RGBA, duration: number }>(1)
    private cardService: CardService;

    constructor(
        {
            highlightService,
            cardService
        }: {
            highlightService: HighlighterService,
            cardService: CardService
        }
    ) {
        this.cardService = cardService;
        highlightService.timedHighlight(
            this.temporaryHighlightRequests$.pipe(
                map(({color, word, duration}) =>
                    (
                        {
                            timeout: duration,
                            delta: HighlighterService.wordToMap(color)(word)
                        }
                    )
                )
            ),
            highlightService.highlightMap$,
            [0, "TEMPORARY_HIGHLIGHT"] // This is a hack, this should be dynamic
            // so as many people can temp highlight as they want.
            // The highlight services need to be split up and done nicer
        )
    }

    public async highlightTemporaryWord(word: string, color: RGBA, duration: number) {
        this.cardService.putWords$.next([word]);
        this.temporaryHighlightRequests$.next({word, color, duration});
        await sleep(duration);
        this.cardService.deleteWords.next([word])
    }
}