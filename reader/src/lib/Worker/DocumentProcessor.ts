/* eslint no-restricted-globals: 0 */
// noinspection JSConstantReassignment
// @ts-ignore
import {DOMParser, XMLSerializer} from 'xmldom';
import {ReaderDocument} from "../Books/Rendering/ReaderDocument";

// @ts-ignore
self["window"] = self;
// @ts-ignore
const ctx: Worker = self as any;



// Respond to message from parent thread
ctx.onmessage = (ev) => {
    const url = ev.data as string;
    const oReq = new XMLHttpRequest();
    oReq.addEventListener("load", response => {
        const doc = new ReaderDocument(new DOMParser().parseFromString(oReq.responseText,'text/html'));
        doc.createMarksUnderLeaves(doc.getTextElements(doc.document.body));
        let innerHTML = new XMLSerializer().serializeToString(doc.document);
        ctx.postMessage(innerHTML);
    });
    oReq.open("GET", url);
    oReq.send();
};

