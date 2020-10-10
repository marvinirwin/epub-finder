import {from, Observable} from "rxjs";
import {XMLSerializer} from "xmldom";
import {AtomizedDocument} from "../Atomized/AtomizedDocument";

export class Website {
    constructor(
        public name: string,
        public url: string,
    ) {
    }
}

export class CustomDocument {
    constructor(
        public name: string,
        public html: string,
    ) {
    }
}

export function getPageSrcHttp(url: string): Observable<string> {
    return from(new Promise<string>(resolve => {
        const oReq = new XMLHttpRequest();
        oReq.addEventListener("load", response => {
            resolve(oReq.responseText);
        });
        oReq.open("GET", url);
        oReq.send();
    }))
}