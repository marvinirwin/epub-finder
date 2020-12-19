/* eslint no-restricted-globals: 0 */
// @ts-ignore
// noinspection JSConstantReassignment
import {AtomizedDocument} from "../Atomized/AtomizedDocument";

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
        ctx.postMessage([doc.toString()]);
    } catch (e) {
        ctx.postMessage([
            JSON.stringify({type: "error", messge: `Could not find ${ev.data}`})
        ]);
    }
};

