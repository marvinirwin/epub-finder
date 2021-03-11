import {
    ElementHighlightMap,
    HighlightDeltaPriorityList,
    HighlightDelta,
    TimedHighlightDelta,
    TargetHighlightPriorityList, HighlightTarget
} from "./highlight.interface";
import {combineLatest, Observable, ReplaySubject} from "rxjs";
import {LtElement} from "./Highlighter";
import {Dictionary} from "lodash";
import {mixRGBA, RGBA} from "./color.service";
import {AtomMetadata} from "../../../../server/src/shared/atom-metadata.interface.ts/atom-metadata";
import {map, shareReplay} from "rxjs/operators";
import debug from 'debug';
import {safePushMap} from "../../../../server/src/shared/safe-push";
const d = debug('highlight:highlighter');

// Priority, highlighterName
export type HighlighterPath = [number, string];

export class HighlighterService {

    public static wordToMap = (rgba: RGBA) => (word: string | undefined) => {
        const m = new Map<string, RGBA>();
        if (word) {
            m.set(word, rgba)
        }
        return m;
    }
    public static wordsToMap = (rgba: RGBA) => (words: string[]) => {
        const m = new Map<string, RGBA>();
        words.forEach(word => m.set(word, rgba))
        return m;
    }

    public highlightMap$ = new ReplaySubject<TargetHighlightPriorityList>(1);


    private highlightTargetMap$: Observable<Map<HighlightTarget, LtElement[]>>;

    constructor({wordElementMap$}: {
        wordElementMap$: Observable<Dictionary<Set<AtomMetadata>>>;
    }) {
        this.highlightTargetMap$ = wordElementMap$.pipe(
            map(
                wordElementMap => {
                    const targetElementMap = new Map<HighlightTarget, LtElement[]>();
                    Object.entries(wordElementMap).forEach(([word, elements]) => {
                        targetElementMap.set(word, [...elements]);
                        elements.forEach(element => targetElementMap.set(
                            element.element as unknown as HTMLElement,
                            [element]
                            )
                        );
                    })
                    return targetElementMap;
                }
            ),
            shareReplay(1)
        );
    }

    public singleHighlight(
        newHighlightDelta$: Observable<HighlightDelta | undefined>,
        highlightPath: HighlighterPath,
    ) {
        let oldHighlightDelta: HighlightDelta | undefined;
        combineLatest([
            newHighlightDelta$,
            this.highlightMap$,
            this.highlightTargetMap$
        ]).subscribe((
            [
                newHighlightDelta,
                currentHighlightMap,
                targetElementMap
            ]) => {
            d(highlightPath);
            d(newHighlightDelta);

            const highlightWordsToUpdate = new Set<string | HTMLElement>();
            if (oldHighlightDelta) {
                /**
                 * For one-at-a-time highlighters delete all previous highlights whenever a new one appears
                 */
                this.removeHighlightDelta(oldHighlightDelta, currentHighlightMap, highlightPath, highlightWordsToUpdate);
            }
            if (newHighlightDelta) {
                oldHighlightDelta = newHighlightDelta;
                this.addHighlightedDelta(
                    newHighlightDelta,
                    currentHighlightMap,
                    highlightPath,
                    highlightWordsToUpdate
                );
            }
            d(highlightWordsToUpdate);
            this.updateHighlightBackgroundColors(
                highlightWordsToUpdate,
                targetElementMap,
                currentHighlightMap,
            );
        })
    }

    public timedHighlight(
        newHighlightDelta$: Observable<TimedHighlightDelta>,
        highlightedWords$: Observable<TargetHighlightPriorityList>,
        highlighterPath: HighlighterPath
    ) {
        combineLatest([
            newHighlightDelta$,
            highlightedWords$,
            this.highlightTargetMap$
        ]).subscribe(([timedHighlightDelta, currentHighlightMap, wordElementMap]) => {
            const highlightWordsToUpdate = new Set<HighlightTarget>();
            const o = timedHighlightDelta.delta;
            this.addHighlightedDelta(o, currentHighlightMap, highlighterPath, highlightWordsToUpdate);
            this.updateHighlightBackgroundColors(highlightWordsToUpdate, wordElementMap, currentHighlightMap);
            setTimeout(() => {
                this.removeHighlightDelta(timedHighlightDelta.delta, currentHighlightMap, highlighterPath, highlightWordsToUpdate);
                this.updateHighlightBackgroundColors(highlightWordsToUpdate, wordElementMap, currentHighlightMap);
            }, timedHighlightDelta.timeout)
        })
    }

    private addHighlightedDelta(
        highlightDelta: HighlightDelta,
        currentHighlightMap: TargetHighlightPriorityList,
        [highlightPriority, highlightKey]: HighlighterPath,
        highlightWordsToUpdate: Set<HighlightTarget>) {
        highlightDelta.forEach((rgba, target) => {
            const priorityArray = currentHighlightMap.get(target) || [];
            if (!priorityArray[highlightPriority]) {
                priorityArray[highlightPriority] = new Map();
            }
            priorityArray[highlightPriority].set(highlightKey, rgba);
            currentHighlightMap.set(target, priorityArray);
            highlightWordsToUpdate.add(target);
        })
    }

    private updateHighlightBackgroundColors(
        targetsToUpdate: Set<HighlightTarget>,
        targetElementMap: Map<HighlightTarget, LtElement[]>,
        wordHighlightMap: TargetHighlightPriorityList,
    ) {
        const computedElementHighlightMap = computeElementHighlightMap(
            targetElementMap,
            wordHighlightMap,
        );
        targetsToUpdate.forEach(word => {
            const elementsToHighlight = targetElementMap.get(word);
            if (!elementsToHighlight) {
                return;
            }
            elementsToHighlight.forEach(elementToHighlight => {
                updateElementBackgroundColor(elementToHighlight, computedElementHighlightMap);
            })
        })
    }

    private removeHighlightDelta(
        oldHighlightDelta: HighlightDelta,
        currentHighlightMap: TargetHighlightPriorityList,
        [highlightPriority, highlighterKey]: HighlighterPath,
        highlightsToUpdate: Set<HighlightTarget>) {
        oldHighlightDelta.forEach((colors, highlightTarget) => {
            const m: HighlightDelta[] | undefined = currentHighlightMap.get(highlightTarget);
            m?.[highlightPriority]?.delete(highlighterKey)
            highlightsToUpdate.add(highlightTarget);
        })
    }
}

function updateElementBackgroundColor(
    elementToHighlight: LtElement,
    elementHighlightMap: ElementHighlightMap) {
    const priorityLists = elementHighlightMap.get(elementToHighlight.element as HTMLElement);
    const rgbas: RGBA[] = [];
    if (priorityLists) {
        let highestPriorityKeyValues: [HighlightTarget, RGBA][] = [];
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
    const backgroundColor = mixRGBA(rgbas);
    // @ts-ignore
    elementToHighlight.element.style.backgroundColor = backgroundColor;
}

const computeElementHighlightMap = (
    wordElementMap: Map<string | HTMLElement, LtElement[]>,
    wordHighlightMap: TargetHighlightPriorityList,
): ElementHighlightMap => {
    const elementHighlightMap: ElementHighlightMap = new Map();
    wordElementMap.forEach((ltElements, targetToUpdate) => {
        ltElements.forEach(ltElement => {
            const wordHighlightMapElement: HighlightDeltaPriorityList = wordHighlightMap.get(targetToUpdate) || [];
            const element = ltElement.element as unknown as HTMLElement;
            safePushMap(
                elementHighlightMap,
                element,
                wordHighlightMapElement
            );
        })
    })
    return elementHighlightMap;
}
