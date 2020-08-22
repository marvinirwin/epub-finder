/* eslint no-restricted-globals: 0 */
// noinspection JSConstantReassignment
import {AtomizedDocument} from "../Atomized/AtomizedDocument";
import {XMLSerializer} from 'xmldom';
import {getPageSrcHttp} from "../Website/Website";

// @ts-ignore
self["window"] = self;
// @ts-ignore
const ctx: Worker = self as any;

// Respond to message from parent thread
ctx.onmessage = async (ev) => {
    const url = ev.data as string;
    const src = await getPageSrcHttp(url).toPromise()
    ctx.postMessage(
        (new XMLSerializer()).serializeToString(AtomizedDocument.atomizeDocument(src).document)
    );
};

