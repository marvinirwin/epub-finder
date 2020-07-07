/* eslint import/no-webpack-loader-syntax:0 */
// @ts-ignore
import HTMLProcessor from 'Worker-loader?name=dist/[name].js!../Worker/HTMLProcessorThread';
import {Observable, ReplaySubject} from "rxjs";
import { Dictionary } from "lodash";
import {Manager} from "../Manager";
import {flatMap, scan, shareReplay} from "rxjs/operators";
import {printExecTime, printExecTimeAsync} from "../Util/Timer";
import {PageRenderer} from "../Pages/Rendering/PageRenderer";
import {Website} from "../Pages/Website";

export class PageManager {
    pageIndex$: Observable<Dictionary<PageRenderer>>
    requestRenderPage$ = new ReplaySubject<Website>(1);
    constructor() {
        this.pageIndex$ = this.requestRenderPage$.pipe(
            flatMap(async page => {
                return printExecTimeAsync("Preprocessing xml DOM", async () => {
                    const documentProcessingWorker = new HTMLProcessor();
                    documentProcessingWorker.postMessage(page.url)
                    const processedXML = new Promise<string>(resolve => documentProcessingWorker.onmessage = (ev: MessageEvent) => resolve(ev.data));
                    let pageRenderer = new PageRenderer(
                        await processedXML,
                        page.name
                    );
                    return pageRenderer
                })
            }),
            scan((acc: Dictionary<PageRenderer>, page: PageRenderer) => {
                acc[page.name] = page;
                return acc;
            }, {}),
            shareReplay(1)
        )
    }
}