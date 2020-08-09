/* eslint no-restricted-globals: 0 */
// noinspection JSConstantReassignment
// @ts-ignore
import {AtomizedDocument} from "../Atomized/AtomizedDocument";
// @ts-ignore
import {XMLSerializer} from 'xmldom';

// @ts-ignore
self["window"] = self;
// @ts-ignore
const ctx: Worker = self as any;

// Respond to message from parent thread
ctx.onmessage = (ev) => {
    const srcdoc = ev.data as string;
    const s = new XMLSerializer();
    ctx.postMessage(
        s.serializeToString(AtomizedDocument.atomizeDocument(srcdoc).document)
    );
};

