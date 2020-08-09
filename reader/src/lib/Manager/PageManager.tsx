/* eslint import/no-webpack-loader-syntax:0 */
// @ts-ignore
import AtomizeUrl from 'Worker-loader?name=dist/[name].js!../Worker/AtomizeUrl';
import {merge, Observable, ReplaySubject} from "rxjs";
import {Dictionary, flatten} from "lodash";
import {flatMap, map, scan, shareReplay, switchMap} from "rxjs/operators";
import {printExecTimeAsync} from "../Util/Timer";
import {PageRenderer} from "../PageRenderer";
import {Website} from "../Website";
import {AtomizedSentence} from "../Atomized/AtomizedSentence";
import {createPopper} from "@popperjs/core";
import {InputManager} from "./InputManager";
import {GetWorkerResults} from "../Util/GetWorkerResults";

export class PageManager {
    pageIndex$: Observable<Dictionary<PageRenderer>>
    pageList$: Observable<PageRenderer[]>;
    atomizedSentences$: Observable<AtomizedSentence[]>;
    requestRenderPage$ = new ReplaySubject<Website>(1);
    constructor() {
        this.pageIndex$ = this.requestRenderPage$.pipe(
            flatMap(async page => {
                return printExecTimeAsync("Preprocessing xml DOM", async () => {
                    const documentProcessingWorker = new AtomizeUrl();
                    const document = await GetWorkerResults(documentProcessingWorker, page.url);
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

        this.atomizedSentences$ = this.pageList$.pipe(
            switchMap(pageList => merge(
                ...pageList.map(page => page.atomizedSentences$)
                ).pipe(map(flatten))
            )
        );

        this.pageList$.pipe(
            switchMap(pageList =>
                merge(...pageList.map(page => page.atomizedSentences$))
            ),
        ).subscribe(atomizedSentences => {
            PageManager.ApplyAtomizedSentenceListeners(atomizedSentences);
        })
    }

    public static ApplyAtomizedSentenceListeners(atomizedSentences: AtomizedSentence[]) {
        atomizedSentences.forEach(s => {
            const showEvents = ['mouseenter', 'focus'];
            const hideEvents = ['mouseleave', 'blur'];
            createPopper(s.getSentenceHTMLElement(), s.getPopperHTMLElement(), {
                placement: 'top-start',
                strategy: 'fixed'
            });

            const show = () => {
                s.getPopperHTMLElement().setAttribute('data-show', '');
            }
            const hide = () => {
                (s.getPopperHTMLElement() as unknown as HTMLElement).removeAttribute('data-show');
            }

            showEvents.forEach(event => {
                s.getSentenceHTMLElement().addEventListener(event, show);
            });

            hideEvents.forEach(event => {
                s.getSentenceHTMLElement().addEventListener(event, hide);
            });
            InputManager.applySentenceElementSelectListener(s)
        });
    }
}