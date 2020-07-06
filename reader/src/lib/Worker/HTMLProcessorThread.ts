/* eslint no-restricted-globals: 0 */
// noinspection JSConstantReassignment
import {AtomizedDocument} from "../Atomize/AtomizedDocument";

// @ts-ignore
self["window"] = self;
// @ts-ignore
const ctx: Worker = self as any;

// Respond to message from parent thread
ctx.onmessage = (ev) => {
    const url = ev.data as string;
    const oReq = new XMLHttpRequest();
    oReq.addEventListener("load", response => {
        ctx.postMessage(AtomizedDocument.atomizeDocument(oReq.responseText));
    });
    oReq.open("GET", url);
    oReq.send();
};

