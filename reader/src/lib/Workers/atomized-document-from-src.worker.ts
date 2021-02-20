/* eslint no-restricted-globals: 0 */
// @ts-ignore
// noinspection JSConstantReassignment
import {AtomizedDocument} from "../../../../server/src/shared/tabulate-documents/atomized-document";
// @ts-ignore
import {XMLSerializer} from 'xmldom';

// @ts-ignore
self.window = self;
// @ts-ignore
const ctx: Worker = self as any;

// Respond to message from parent thread
ctx.onmessage = (ev) => {
    const srcdoc = ev.data as string;
    const doc = AtomizedDocument.atomizeDocument(srcdoc);
    ctx.postMessage(
            doc.toString(),
    );
};

