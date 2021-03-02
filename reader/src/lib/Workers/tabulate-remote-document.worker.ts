/* eslint no-restricted-globals: 0 */
// @ts-ignore
// noinspection JSConstantReassignment
import {TabulateRemoteDocumentDto} from "./tabulate-remote-document.dto";
import {AtomizedDocument,Segment,tabulatedSentenceToTabulatedDocuments} from "@shared/";
import trie from "trie-prefix-tree";
import {SetWithUniqueLengths} from "../../../../server/src/shared/tabulate-documents/set-with-unique-lengths";

// @ts-ignore
self.window = self;
// @ts-ignore
const ctx: Worker = self as any;

ctx.onmessage = async (ev) => {
    const {trieWords, d: {filename, name}}: TabulateRemoteDocumentDto = ev.data;
    const response = await fetch(`${process.env.PUBLIC_URL}/documents/${filename}`);
    const documentSrc = new TextDecoder().decode(await response.arrayBuffer());
    const doc = AtomizedDocument.atomizeDocument(documentSrc);
    const tabulated = tabulatedSentenceToTabulatedDocuments(Segment.tabulate(
        new SetWithUniqueLengths(trieWords),
        doc.segments(),
    ), name);
    ctx.postMessage(tabulated);
};

