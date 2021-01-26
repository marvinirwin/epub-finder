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
        const text = ev.data as string;
        for (let substrStart = 0; substrStart < text.length; substrStart++) {
            for (let i = MIN_SEQUENCE_LENGTH; i < MAX_SEQUENCE_LENGTH; i++) {
                const substr = text.slice(substrStart, i);
                if (!popularityMap.has(substr)){
                    popularityMap.set(substr,1);
                } else {
                    popularityMap.set(substr,<number>popularityMap.get(substr))
                }
            }
        }
        // Now get those words which have more than 3 counts
        const popularEntries = [...popularityMap.entries()].filter(
            ([str, count]) => count >= POPULAR_SEQUENCE_COUNT_THRESHOLD
        );
        const message: string[] = popularEntries.map(([str]) => str);
        ctx.postMessage(message);
    } catch (e) {
        ctx.postMessage({type: "error", message: e} as WorkerError);
    }
};

