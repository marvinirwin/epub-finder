import {map} from "rxjs/operators";
import {HighlightDelta} from "./highlight.interface";
import {HighlighterPath, HighlighterService} from "./highlighter.service";
import {Observable} from "rxjs";

const highlightPath: HighlighterPath = [2, 'DIFFICULTY_HIGHLIGHT'];

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

        highlighterService.singleHighlight(
            rows$.pipe(map(getHighlightDelta)),
            highlighterService.highlightMap$,
            highlightPath
        );
        const now = new Date();
        function getDatePercentage(d: Date): number {
            const date = d.getTime();
            const sevenDays = 86400000 * 7;
            const SevenDaysAgo = now.getTime() - sevenDays;
            const sevenDaysInTheFuture = now.getTime() + sevenDays;
            const fourteenDays = sevenDays * 2;
            const clampedDate = HighlightDifficultyService.clamp(0.001, fourteenDays - 0.001 , date - SevenDaysAgo);
            const percentage = clampedDate / fourteenDays * 100;
            return percentage;
        }
    };

    static clamp(min: number, max: number, v: number) {
        if (v < min) return min;
        if (v > max) return max;
        return v;
    }
}