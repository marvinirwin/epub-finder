/* eslint import/no-webpack-loader-syntax:0 */
// @ts-ignore
import HTMLProcessor from 'Worker-loader?name=dist/[name].js!../Worker/HTMLProcessorThread';
import {Observable, ReplaySubject} from "rxjs";
import {Dictionary} from "lodash";
import {flatMap, map, scan, shareReplay} from "rxjs/operators";
import {printExecTimeAsync} from "../Util/Timer";
import {PageRenderer} from "../Pages/Rendering/PageRenderer";
import {Website} from "../Pages/Website";
import {XMLSerializer} from 'xmldom';

export class PageManager {
    pageIndex$: Observable<Dictionary<PageRenderer>>
    pageList$: Observable<PageRenderer[]>;
    requestRenderPage$ = new ReplaySubject<Website>(1);
    constructor() {
        this.pageIndex$ = this.requestRenderPage$.pipe(
            flatMap(async page => {
                return printExecTimeAsync("Preprocessing xml DOM", async () => {
                    const documentProcessingWorker = new HTMLProcessor();
                    documentProcessingWorker.postMessage(page.url)
                    // Wait how does this come from the worker as an intact document?
                    const document = await new Promise<string>(resolve => documentProcessingWorker.onmessage = (ev: MessageEvent) => resolve(ev.data));
                    return new PageRenderer(
                        document,
                        page.name
                    )
                })
            }),
            scan((acc: Dictionary<PageRenderer>, page: PageRenderer) => {
                acc[page.name] = page;
                return acc;
            }, {}),
            shareReplay(1)
        )
        this.pageList$ = this.pageIndex$.pipe(map(pageIndex => Object.values(pageIndex)), shareReplay(1))
    }
}