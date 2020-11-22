import {
    ElementHighlightMap,
    HighlightDelta,
    HighlightDeltaPriorityList,
    HighlightedWord,
    TimedHighlightDelta,
    WordHighlightMap
} from "./highlight.interface";
import {combineLatest, Observable, ReplaySubject} from "rxjs";
import {ElementContainer} from "./Highlighter";
import {safePushMap} from "../../test/Util/GetGraphJson";
import {Dictionary} from "lodash";
import {mixRGBA, RGBA} from "./color.service";
import {IAnnotatedCharacter} from "../Interfaces/Annotation/IAnnotatedCharacter";


export type HighlighterPath = [number, string];

export class HighlighterService {

    public static wordToMap = (rgba: RGBA) => (word: string | undefined) => {
        const m = new Map<string, RGBA>();
        if (word) {
            m.set(word, rgba)
        }
        return m;
    }

    public highlightMap$ = new ReplaySubject<WordHighlightMap>(1);
    private wordElementMap$: Observable<Dictionary<IAnnotatedCharacter[]>>;

    constructor({
        wordElementMap$
                }: {
        wordElementMap$: Observable<Dictionary<IAnnotatedCharacter[]>>;
    }) {
        this.wordElementMap$ = wordElementMap$;
    }


    removeHighlightDelta(
        oldHighlightDelta: HighlightDelta,
        currentHighlightMap: WordHighlightMap,
        [highlightPriority, highlightKey]: HighlighterPath,
        highlightWordsToUpdate: Set<string>) {
        oldHighlightDelta.forEach((colors, word) => {
            currentHighlightMap[word][highlightPriority].delete(highlightKey);
            highlightWordsToUpdate.add(word);
        })
    }

    singleHighlight(
        newHighlightDelta$: Observable<HighlightDelta | undefined>,
        highlightedWords$: Observable<WordHighlightMap>,
        highlightPath: HighlighterPath,
    ) {
        let oldHighlightDelta: HighlightDelta | undefined;
        combineLatest([
            newHighlightDelta$,
            highlightedWords$,
            this.wordElementMap$
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
            this.updateHighlightBackgroundColors(
                highlightWordsToUpdate,
                wordElementMap,
                currentHighlightMap
            );
        })
    }


    addHighlightedDelta(
        highlightDelta: HighlightDelta,
        currentHighlightMap: WordHighlightMap,
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
        highlightedWords$: Observable<WordHighlightMap>,
        highlighterPath: HighlighterPath
    ) {
        combineLatest([
            newHighlightDelta$,
            highlightedWords$,
            this.wordElementMap$
        ]).subscribe(([timedHighlightDelta, currentHighlightMap, wordElementMap]) => {
            const highlightWordsToUpdate = new Set<string>();
            const o = timedHighlightDelta.delta;
            this.addHighlightedDelta(o, currentHighlightMap, highlighterPath, highlightWordsToUpdate);
            this.updateHighlightBackgroundColors(highlightWordsToUpdate, wordElementMap, currentHighlightMap);
            setTimeout(() => {
                this.removeHighlightDelta(timedHighlightDelta.delta, currentHighlightMap, highlighterPath, highlightWordsToUpdate);
                this.updateHighlightBackgroundColors(highlightWordsToUpdate, wordElementMap, currentHighlightMap);
            }, timedHighlightDelta.timeout)
        })
    }

    updateHighlightBackgroundColors(
        wordsToUpdate: Set<string>,
        wordElementMap: Dictionary<ElementContainer[]>,
        wordHighlightMap: WordHighlightMap) {
        const elementHighlightMap = computeElementHighlightMap(wordElementMap, wordHighlightMap)
        for (const word of wordsToUpdate) {
            const elementsToHighlight = wordElementMap[word];
            if (!elementsToHighlight) continue;
            elementsToHighlight.forEach(elementToHighlight => {
                updateElementBackgroundColor(elementToHighlight, elementHighlightMap);
            })
        }
    }
}

function updateElementBackgroundColor(
    elementToHighlight: ElementContainer,
    elementHighlightMap: Map<HTMLElement, HighlightDeltaPriorityList[]>) {
    // @ts-ignore
    const priorityLists = elementHighlightMap.get(elementToHighlight.element);
    const rgbas: RGBA[] = [];
    if (priorityLists) {
        let highestPriorityKeyValues: Array<[string, RGBA]> = [];
        let highestPriority: number = Number.MAX_SAFE_INTEGER;
        priorityLists.forEach(priorityList => {
                const highestPriorityMapIndex = priorityList.findIndex(highlightDelta => highlightDelta && highlightDelta.size > 0);
                if (highestPriorityMapIndex === highestPriority) {
                    highestPriorityKeyValues.push(...priorityList[highestPriorityMapIndex]);
                } else if (highestPriorityMapIndex !== -1 && highestPriorityMapIndex < highestPriority) {
                    highestPriority = highestPriorityMapIndex;
                    highestPriorityKeyValues = [...priorityList[highestPriorityMapIndex]];
                }

            }
        );
        (new Map(highestPriorityKeyValues)).forEach(rgba => rgbas.push(rgba));
    }
    // @ts-ignore
    return elementToHighlight.element.style.backgroundColor = mixRGBA(rgbas);
}

const computeElementHighlightMap = (
    wordElementMap: { [word: string]: ElementContainer[] },
    wordHighlightMap: WordHighlightMap): ElementHighlightMap => {
    const elementHighlightMap: ElementHighlightMap = new Map();
    Object.entries(wordElementMap).forEach(([wordToUpdate]) => {
        (wordElementMap[wordToUpdate] || [])
            .forEach(annotatedCharacters => {
                const wordHighlightMapElement: HighlightedWord[] = wordHighlightMap[wordToUpdate] || [];
                safePushMap(
                    elementHighlightMap,
                    annotatedCharacters.element as unknown as HTMLElement,
                    wordHighlightMapElement
                );
            });
    })
    return elementHighlightMap;
}
