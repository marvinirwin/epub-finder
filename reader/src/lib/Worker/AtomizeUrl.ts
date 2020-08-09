/* eslint no-restricted-globals: 0 */
// noinspection JSConstantReassignment
import {AtomizedDocument} from "../Atomized/AtomizedDocument";
import {XMLSerializer} from 'xmldom';

// @ts-ignore
self["window"] = self;
// @ts-ignore
const ctx: Worker = self as any;

// Respond to message from parent thread
ctx.onmessage = (ev) => {
    const url = ev.data as string;
    const oReq = new XMLHttpRequest();
    oReq.addEventListener("load", response => {
        const s = new XMLSerializer();
        ctx.postMessage(
            s.serializeToString(AtomizedDocument.atomizeDocument(oReq.responseText).document)
        );
    });
    oReq.open("GET", url);
    oReq.send();
};

