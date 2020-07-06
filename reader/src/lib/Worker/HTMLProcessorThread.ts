/* eslint no-restricted-globals: 0 */
// noinspection JSConstantReassignment
import {AtomizeDocument} from "../Pages/Rendering/AtomizeDocument";

// @ts-ignore
self["window"] = self;
// @ts-ignore
const ctx: Worker = self as any;

// Respond to message from parent thread
ctx.onmessage = (ev) => {
    const url = ev.data as string;
    const oReq = new XMLHttpRequest();
    oReq.addEventListener("load", response => {
        ctx.postMessage(AtomizeDocument.atomize(oReq.responseText));
    });
    oReq.open("GET", url);
    oReq.send();
};

