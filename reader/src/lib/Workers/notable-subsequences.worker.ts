/* eslint no-restricted-globals: 0 */
// @ts-ignore
// noinspection JSConstantReassignment
import {AtomizedDocument} from "../Atomized/atomized-document";
import {WorkerError} from "./WorkerHelpers";

// @ts-ignore
self.window = self;
// @ts-ignore
const ctx: Worker = self as any;

const MAX_SEQUENCE_LENGTH = 20;
const MIN_SEQUENCE_LENGTH = 3;
const POPULAR_SEQUENCE_COUNT_THRESHOLD = 3;

ctx.onmessage = async (ev) => {
    try {
        const popularityMap = new Map<string, number>();
        const characterSet = new Set<string>();
        const text = ev.data as string;
        for (let substrStart = 0; substrStart < text.length; substrStart++) {
            characterSet.add(text[substrStart])
            for (let i = MIN_SEQUENCE_LENGTH; i < MAX_SEQUENCE_LENGTH; i++) {
                const substr = text.slice(substrStart, i);
                if (!popularityMap.has(substr)){
                    popularityMap.set(substr,1);
                } else {
                    popularityMap.set(substr,<number>popularityMap.get(substr) + 1)
                }
            }
        }
        // Now get those words which have more than 3 counts
        const popularEntries = [...popularityMap.entries()].filter(
            ([str, count]) => count >= POPULAR_SEQUENCE_COUNT_THRESHOLD
        );
        const popularStrings: string[] = popularEntries.map(([str]) => str);
        ctx.postMessage({popularStrings, characterSet: [...characterSet].filter(c => c.trim())});
    } catch (e) {
        ctx.postMessage({errorMessage: e} as WorkerError);
    }
};

