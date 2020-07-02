/* eslint import/no-webpack-loader-syntax:0 */
// @ts-ignore
import HTMLProcessor from 'Worker-loader?name=dist/[name].js!../Worker/HTMLProcessorThread';
import {PageRenderer} from "../Books/Rendering/PageRenderer";
import {Observable, ReplaySubject} from "rxjs";
import { Dictionary } from "lodash";
import {Manager} from "../Manager";
import {Website} from "../Books/Website";
import {flatMap, scan} from "rxjs/operators";
import { strict as assert } from 'assert';
import {printExecTime, printExecTimeAsync} from "../Util/Timer";

export class PageManager {
    pageIndex$: Observable<Dictionary<PageRenderer>>
    requestRenderPage$ = new ReplaySubject<Website>(1);
    constructor(public m: Manager) {
        this.pageIndex$ = this.requestRenderPage$.pipe(
            flatMap(async page => {
                return printExecTimeAsync("Preprocessing xml DOM", async () => {
                    const documentProcessingWorker = new HTMLProcessor();
                    documentProcessingWorker.postMessage(page.url)
                    const processedXML = new Promise<string>(resolve => documentProcessingWorker.onmessage = (ev: MessageEvent) => resolve(ev.data));
                    let pageRenderer = new PageRenderer(
                        await processedXML,
                        this.m,
                        page.name
                    );
                    return pageRenderer
                })
            }),
            scan((acc: Dictionary<PageRenderer>, page: PageRenderer) => {
                acc[page.name] = page;
                return acc;
            }, {})
        )
    }
}