import {HighlightDifficultyService} from "./highlight-difficulty.service";
import {PronunciationProgressRow} from "../schedule/pronunciation-progress-row.interface";
import {PronunciationProgressRepository} from "../schedule/pronunciation-progress.repository";
import {HighlighterService} from "./highlighter.service";
import {ds_Dict} from "../delta-scan/delta-scan.module";
import {HighlightDelta} from "./highlight.interface";
import {RGBA} from "./color.service";
import {colorForPercentage} from "../color/Range";
import debug from 'debug';
const d = debug('highlight:pronunciation');

export class HighlightPronunciationProgressService extends HighlightDifficultyService<ds_Dict<PronunciationProgressRow[]>> {
    constructor({
                    pronunciationProgressService,
                    highlighterService
                }: {
        pronunciationProgressService: PronunciationProgressRepository,
        highlighterService: HighlighterService
    }) {
        super({
            highlighterService,
            rows$: pronunciationProgressService.records$,
            getHighlightDelta: pronunciationRows => {
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
                d(Object.fromEntries(highlights))
                return highlights;
            },
            highlightPath: [0, 'HIGHLIGHT_PRONUNCIATION_DIFFICULTY']
        })
    }
}