/* eslint no-restricted-globals: 0 */
// noinspection JSConstantReassignment
import {AtomizedDocument} from "../Atomized/AtomizedDocument";
import {XMLSerializer} from 'xmldom';
import {getSrcHttp} from "../WebSite/Website";

// @ts-ignore
self["window"] = self;
// @ts-ignore
const ctx: Worker = self as any;

// Respond to message from parent thread
ctx.onmessage = async (ev) => {
    const url = ev.data as string;
    const src = await getSrcHttp(url)
    ctx.postMessage(
        (new XMLSerializer()).serializeToString(AtomizedDocument.atomizeDocument(src).document)
    );
};

