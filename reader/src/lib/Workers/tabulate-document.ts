/* eslint no-restricted-globals: 0 */
// @ts-ignore
// noinspection JSConstantReassignment
import {AtomizedDocument} from "../../../../server/src/shared/tabulate-documents/atomized-document";
import {Segment} from "../../../../server/src/shared/tabulate-documents/segment";
import {TabulateDocumentDto} from "./tabulate-document.dto";
import {tabulatedSentenceToTabulatedDocuments} from "@shared/";
import trie from "trie-prefix-tree";

// @ts-ignore
self.window = self;
// @ts-ignore
const ctx: Worker = self as any;

ctx.onmessage = async (ev) => {
    const {trieWords, d: {filename, name}}: TabulateDocumentDto = ev.data;
    const response = await fetch(`${process.env.PUBLIC_URL}/documents/${filename}`);
    const documentSrc = new TextDecoder().decode(await response.arrayBuffer());
    const doc = AtomizedDocument.atomizeDocument(documentSrc);
    const tabulated = tabulatedSentenceToTabulatedDocuments(Segment.tabulate(
        trie(trieWords),
        doc.segments(),
    ), name);
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

