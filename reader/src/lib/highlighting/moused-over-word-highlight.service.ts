import {ReplaySubject} from "rxjs";
import {HighlighterService} from "./highlighter.service";
import {map} from "rxjs/operators";

export class MousedOverWordHighlightService {
    mousedOverWord$ = new ReplaySubject<string | undefined>(1);

    constructor(
        {highlighterService}:
            { highlighterService: HighlighterService }
    ) {
        const {wordToMap} = HighlighterService;
        highlighterService.singleHighlight(
            this.mousedOverWord$.pipe(
                map(wordToMap([160, 160, 160, 0.5]))
            ),
            [0, 'MOUSEOVER_CHARACTER_HIGHLIGHT']
        );
    }
}