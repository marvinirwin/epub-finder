import {HighlightDelta, HighlightMap, TimedHighlightDelta} from "./highlight.interface";
import {combineLatest, Observable} from "rxjs";
import {ds_Dict} from "../Util/DeltaScanner";
import {HasElement, HighlighterPath, recomputeColor} from "./Highlighter";

export class HighlighterService {
    // I'm going to need to maintain a map which contains maps from elements to highlights
    // When all the highlights for that map are gone then I can delete the key too, to let the garbage collector konw its gone
    // Wait do I have to do that?  Will javascript know if that key is gone?

    removeHighlightDelta(
        oldHighlightDelta: HighlightDelta,
        currentHighlightMap: HighlightMap,
        [highlightPriority, highlightKey]: HighlighterPath,
        highlightWordsToUpdate: Set<string>) {
        oldHighlightDelta.forEach((colors, word) => {
            currentHighlightMap[word][highlightPriority].delete(highlightKey);
            highlightWordsToUpdate.add(word);
        })
    }

    singleHighlight(
        newHighlightDelta$: Observable<HighlightDelta | undefined>,
        highlightedWords$: Observable<HighlightMap>,
        wordElementMap$: Observable<ds_Dict<HasElement[]>>,
        highlightPath: HighlighterPath,
    ) {
        let oldHighlightDelta: HighlightDelta | undefined;
        combineLatest([
            newHighlightDelta$,
            highlightedWords$,
            wordElementMap$
        ]).subscribe(([newHighlightDelta, currentHighlightMap, wordElementMap]) => {
            const highlightWordsToUpdate = new Set<string>();
            if (oldHighlightDelta) {
                /**
                 * For one-at-a-time highlighters delete all previous highlights whenever a new one appears
                 */
                this.removeHighlightDelta(oldHighlightDelta, currentHighlightMap, highlightPath, highlightWordsToUpdate);
            }
            if (newHighlightDelta) {
                oldHighlightDelta = newHighlightDelta;
                this.addHighlightedDelta(newHighlightDelta, currentHighlightMap, highlightPath, highlightWordsToUpdate);
            }
            this.updateHighlightBackgroundColors(highlightWordsToUpdate, wordElementMap, currentHighlightMap);
        })
    }

    updateHighlightBackgroundColors(
        highlightWordsToUpdate: Set<string>,
        wordElementMap: ds_Dict<HasElement[]>,
        currentHighlightMap: HighlightMap) {
        // @ts-ignore
        for (const word of highlightWordsToUpdate) {
            const elements = wordElementMap[word];

            if (!elements) continue;
            const highestPriorityColors = currentHighlightMap[word].find(map => map && map.size);
            const backgroundColor = recomputeColor(
                highestPriorityColors
            );

            elements.forEach(element => {
                // @ts-ignore
                return element.element.style.backgroundColor = backgroundColor;
            })
        }
    }

    addHighlightedDelta(
        highlightDelta: HighlightDelta,
        currentHighlightMap: HighlightMap,
        [highlightPriority, highlightKey]: HighlighterPath,
        highlightWordsToUpdate: Set<string>) {
        highlightDelta.forEach((rgba, word) => {
            if (!currentHighlightMap[word]) {
                currentHighlightMap[word] = [];
            }
            if (!currentHighlightMap[word][highlightPriority]) {
                currentHighlightMap[word][highlightPriority] = new Map();
            }
            currentHighlightMap[word][highlightPriority].set(highlightKey, rgba);
            highlightWordsToUpdate.add(word);
        })
    }

    timedHighlight(
        newHighlightDelta$: Observable<TimedHighlightDelta>,
        highlightedWords$: Observable<HighlightMap>,
        wordElementMap$: Observable<ds_Dict<HasElement[]>>,
        highlighterPath: HighlighterPath
    ) {
        combineLatest([
            newHighlightDelta$,
            highlightedWords$,
            wordElementMap$
        ]).subscribe(([timedHighlightDelta, currentHighlightMap, wordElementMap]) => {
            const highlightWordsToUpdate = new Set<string>();
            const o = timedHighlightDelta.delta;
            this.addHighlightedDelta(o, currentHighlightMap, highlighterPath, highlightWordsToUpdate);
            // @ts-ignore
            updateHighlightBackgroundColors(highlightWordsToUpdate, wordElementMap, currentHighlightMap);
            setTimeout(() => {
                this.removeHighlightDelta(timedHighlightDelta.delta, currentHighlightMap, highlighterPath, highlightWordsToUpdate);
                this.updateHighlightBackgroundColors(highlightWordsToUpdate, wordElementMap, currentHighlightMap);
            }, timedHighlightDelta.timeout)
        })
    }
}

