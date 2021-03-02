import {map} from "rxjs/operators";
import {HighlightDelta} from "./highlight.interface";
import {HighlighterPath, HighlighterService} from "./highlighter.service";
import {Observable} from "rxjs";

export class HighlightDifficultyService<T> {
    constructor(
        {
            highlighterService,
            getHighlightDelta,
            rows$,
            highlightPath
        }: {
            highlighterService: HighlighterService,
            rows$: Observable<T>,
            getHighlightDelta: (t: T) => HighlightDelta,
            highlightPath: HighlighterPath
        }) {

/*
        highlighterService.singleHighlight(
            rows$.pipe(map(getHighlightDelta)),
            highlightPath
        );
*/
    };

    static clamp(min: number, max: number, v: number) {
        if (v < min) return min;
        if (v > max) return max;
        return v;
    }
}