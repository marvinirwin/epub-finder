/* eslint no-restricted-globals: 0 */
// @ts-ignore
// noinspection JSConstantReassignment
import {AtomizedDocument} from "../Atomized/AtomizedDocument";

// @ts-ignore
self["window"] = self;
// @ts-ignore
const ctx: Worker = self as any;


// Respond to message from parent thread
ctx.onmessage = async (ev) => {
    const url = ev.data as string;
    const response = await fetch(url);
    const srcDoc = new TextDecoder().decode(await response.arrayBuffer());
    ctx.postMessage(
        (new XMLSerializer()).serializeToString(AtomizedDocument.atomizeDocument(srcDoc).document)
    );
};

