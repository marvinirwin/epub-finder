/* eslint import/no-webpack-loader-syntax:0 */
// @ts-ignore
import DocumentProcessor from 'Worker-loader?name=dist/[name].js!../Worker/DocumentProcessor';
import {PageRenderer} from "../Books/Rendering/PageRenderer";
import {Observable, ReplaySubject} from "rxjs";
import { Dictionary } from "lodash";
import {Manager} from "../Manager";
import {Website} from "../Books/Website";
import {flatMap, scan} from "rxjs/operators";
import { strict as assert } from 'assert';
import {printExecTime} from "../Util/Timer";

export class PageManager {
    pageIndex$: Observable<Dictionary<PageRenderer>>
    requestRenderPage$ = new ReplaySubject<Website>(1);
    constructor(public m: Manager) {
        this.pageIndex$ = this.requestRenderPage$.pipe(
            flatMap(async page => {
                return printExecTime("Preprocessing xml DOM", async () => {
                    const documentProcessingWorker = new DocumentProcessor();
                    documentProcessingWorker.postMessage(page.url)
                    const processedXML = new Promise<string>(resolve => documentProcessingWorker.onmessage = resolve);
                    return new PageRenderer(
                        await processedXML,
                        this.m,
                        page.name
                    )
                })
            }),
            scan((acc: Dictionary<PageRenderer>, page: PageRenderer) => {
                // Screw it let's just assume nothing is in the acc
                assert(!acc[page.name]);

                acc[page.name] = page;
                return acc;
            }, {})
        )
    }
}