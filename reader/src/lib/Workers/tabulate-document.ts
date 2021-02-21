/* eslint no-restricted-globals: 0 */
// @ts-ignore
// noinspection JSConstantReassignment
import {AtomizedDocument} from "../../../../server/src/shared/tabulate-documents/atomized-document";
import {InterpolateExampleSentencesService} from "../../components/example-sentences/interpolate-example-sentences.service";
import {Segment} from "../../../../server/src/shared/tabulate-documents/segment";
import {uniq} from "lodash";
import {TabulateDocumentDto} from "./tabulate-document.dto";
import {tabulatedSentenceToTabulatedDocuments} from "../../../../server/src/shared/tabulate-documents/tabulated-documents.interface";
import trie from "trie-prefix-tree";

// @ts-ignore
self.window = self;
// @ts-ignore
const ctx: Worker = self as any;

ctx.onmessage = async (ev) => {
    const {trieWords, d}: TabulateDocumentDto = ev.data;
    const t = trie(trieWords)
    const response = await fetch(`${process.env.PUBLIC_URL}/documents/${d.filename}`);
    const documentSrc = new TextDecoder().decode(await response.arrayBuffer());
    const doc = AtomizedDocument.atomizeDocument(documentSrc);
    const tabulated = tabulatedSentenceToTabulatedDocuments(Segment.tabulate(
        t,
        doc.segments(),
    ), d.name);
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

