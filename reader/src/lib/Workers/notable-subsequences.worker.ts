/* eslint no-restricted-globals: 0 */
// @ts-ignore
// noinspection JSConstantReassignment
import {AtomizedDocument} from "../atomized/atomized-document";
import {WorkerError} from "./worker.helpers";
import axios from "axios";
import {TrieWrapper} from "../TrieWrapper";
import {ITrie} from "../interfaces/Trie";
import {InterpolateExampleSentencesService} from "../../components/example-sentences/interpolate-example-sentences.service";
import uniqueBy from "@popperjs/core/lib/utils/uniqueBy";
import {Segment} from "../atomized/segment";
import { uniq } from "lodash";

// @ts-ignore
self.window = self;
// @ts-ignore
const ctx: Worker = self as any;

ctx.onmessage = async (ev) => {
    const {trie, url}: {trie: ITrie, url: string} = ev.data;
    const response = await fetch(url);
    const characters = new TextDecoder().decode(await response.arrayBuffer());
    const doc = AtomizedDocument.atomizeDocument(InterpolateExampleSentencesService.interpolate([characters]));
    const tabulated = Segment.tabulate(
        trie,
        uniq(trie.getWords().map(word => word.length)),
        doc.segments(),
    );
    ctx.postMessage(tabulated);
/*
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
    } catch (e) {
        ctx.postMessage({errorMessage: e} as WorkerError);
    }
*/
};

