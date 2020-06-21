/* eslint no-restricted-globals: 0 */
// @ts-ignore Workers don't have the window object
import {AnkiPackage} from "../../../Anki";
import {Subject} from "rxjs";
import {invert} from "lodash";
import initSqlJs from "sql.js";
// @ts-ignore
import JSZip from 'jszip';
// @ts-ignore
import {getBinaryContent} from 'jszip-utils';
import {SerializedAnkiPackage} from "./SerializedAnkiPackage";

// noinspection JSConstantReassignment
// @ts-ignore
self.window = self;
// @ts-ignore
const ctx: Worker = self as any;


// Respond to message from parent thread
ctx.onmessage = (ev) => {
    let {name, path}: { name: string, path: string } = JSON.parse(ev.data);
    try {
        // const l = new BookLoader(name, path);

    } catch (e) {
        console.error(e);
    }
};

