import {CORRECT_RECOGNITION_SCORE, Highlighter} from "./Highlighter";
import {ScheduleManager} from "../Manager/ScheduleManager";
import {map} from "rxjs/operators";
import {HighlightDelta} from "./highlight.interface";
import {RGBA} from "./color.service";
import {colorForPercentage} from "../color/Range";
import {HighlighterService} from "./highlighter.service";

export class HighlightDifficultyService {
    constructor(
        {
            highlighterService,
            scheduleManager
        }: {
            highlighterService: HighlighterService,
            scheduleManager: ScheduleManager
        }) {

        highlighterService.singleHighlight(
            scheduleManager.indexedScheduleRows$.pipe(map(indexedScheduleRows => {
                const highlights: HighlightDelta = new Map<string, RGBA>();
                for (const word in indexedScheduleRows) {
                    const row = indexedScheduleRows[word];
                    if (row.wordRecognitionRecords.length) {
                        let correct = 0;
                        for (let i = row.wordRecognitionRecords.length - 1; i >= 0; i--) {
                            const wordRecognitionRecord = row.wordRecognitionRecords[i];
                            if (wordRecognitionRecord.recognitionScore >= CORRECT_RECOGNITION_SCORE) {
                                correct++;
                            } else {
                                break;
                            }
                        }
                        highlights.set(word, colorForPercentage(HighlightDifficultyService.clamp(0.001, correct * 25, 100)))
                    }
                }
                return highlights;
            })),
            highlighterService.highlightMap$,
            [2, 'DIFFICULTY_HIGHLIGHT']
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
    private static clamp(min: number, max: number, v: number) {
        if (v < min) return min;
        if (v > max) return max;
        return v;
    }
}