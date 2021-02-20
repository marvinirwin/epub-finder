/* eslint no-restricted-globals: 0 */
// @ts-ignore
// noinspection JSConstantReassignment
import {AtomizedDocument} from "../../../../server/src/shared/tabulate-documents/atomized-document";
import {WorkerError} from "./worker.helpers";

// @ts-ignore
self.window = self;
// @ts-ignore
const ctx: Worker = self as any;

ctx.onmessage = async (ev) => {
    try {
        const url = ev.data as string;
        const response = await fetch(url);
        const srcdoc = new TextDecoder().decode(await response.arrayBuffer());
        const doc = AtomizedDocument.atomizeDocument(srcdoc);
        ctx.postMessage(doc.toString());
    } catch (e) {
        ctx.postMessage({type: "error", errorMessage: `Could not find ${e.toString()}`} as WorkerError);
    }
};

