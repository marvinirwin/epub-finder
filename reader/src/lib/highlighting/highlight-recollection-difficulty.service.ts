import {HighlightDifficultyService} from "./highlight-difficulty.service";
import {WordRecognitionRow} from "../schedule/word-recognition-row";
import {HighlighterService} from "./highlighter.service";
import {HighlightDelta} from "./highlight.interface";
import {ds_Dict} from "../delta-scan/delta-scan.module";
import {WordRecognitionProgressRepository} from "../schedule/word-recognition-progress.repository";
import {RGBA} from "./color.service";
import {CORRECT_RECOGNITION_SCORE} from "./Highlighter";
import {colorForPercentage} from "../color/Range";

export class HighlightRecollectionDifficultyService extends HighlightDifficultyService<ds_Dict<WordRecognitionRow[]>> {
    constructor({
                    wordRecognitionRowService,
                    highlighterService
                }: {
        wordRecognitionRowService: WordRecognitionProgressRepository,
        highlighterService: HighlighterService
    }) {
        super({
            highlighterService,
            rows$: wordRecognitionRowService.records$,
            getHighlightDelta: wordRecognitionRows => {
                const highlights: HighlightDelta = new Map<string, RGBA>();
                for (const word in wordRecognitionRows) {
                    const row = wordRecognitionRows[word];
                    if (row.length) {
                        let correct = 0;
                        for (let i = row.length - 1; i >= 0; i--) {
                            const wordRecognitionRecord = row[i];
                            if (wordRecognitionRecord.grade >= CORRECT_RECOGNITION_SCORE) {
                                correct++;
                            } else {
                                break;
                            }
                        }
                        highlights.set(
                            word,
                            colorForPercentage(HighlightDifficultyService.clamp(0.001, correct * 25, 100))
                        )
                    }
                }
                return highlights;
            },
            highlightPath: [0, 'HIGHLIGHT_RECOGNITION_DIFFICULTY_DIFFICULTY']
        })
    }
}