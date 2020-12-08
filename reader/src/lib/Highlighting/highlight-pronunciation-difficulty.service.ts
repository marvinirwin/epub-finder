import {HighlightDifficultyService} from "./highlight-difficulty.service";
import {PronunciationProgressRow} from "../schedule/pronunciation-progress-row.interface";
import {PronunciationProgressService} from "../schedule/pronunciation-progress.service";
import {HighlighterService} from "./highlighter.service";
import {ds_Dict} from "../Tree/DeltaScanner";
import {HighlightDelta} from "./highlight.interface";
import {RGBA} from "./color.service";
import {colorForPercentage} from "../color/Range";

export class HighlightPronunciationDifficultyService extends HighlightDifficultyService<ds_Dict<PronunciationProgressRow[]>> {
    constructor({
                    pronunciationProgressService,
                    highlighterService
                }: {
        pronunciationProgressService: PronunciationProgressService,
        highlighterService: HighlighterService
    }) {
        super({
            highlighterService,
            rows$: pronunciationProgressService.records$,
            getHighlightDelta: pronunciationRows => {
                debugger;
                const highlights: HighlightDelta = new Map<string, RGBA>();
                for (const word in pronunciationRows) {
                    const row = pronunciationRows[word];
                    if (row.length) {
                        let correct = 0;
                        for (let i = row.length - 1; i >= 0; i--) {
                            const wordRecognitionRecord = row[i];
                            if (wordRecognitionRecord.success) {
                                correct++;
                            } else {
                                break;
                            }
                        }
                        highlights.set(word, colorForPercentage(HighlightDifficultyService.clamp(0.001, 1, correct / 10)))
                    }
                }
                return highlights;
            },
            highlightPath: [0, 'HIGHLIGHT_PRONUNCIATION_DIFFICULTY']
        })
    }
}