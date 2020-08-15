import {merge, Observable, ReplaySubject} from "rxjs";
import {Dictionary, flatten} from "lodash";
import {map, scan, shareReplay, switchMap} from "rxjs/operators";
import {BookFrame} from "../BookFrame/BookFrame";
import {Website} from "../Website/Website";
import {AtomizedSentence} from "../Atomized/AtomizedSentence";
import {createPopper} from "@popperjs/core";
import {InputManager} from "./InputManager";

export interface PageManagerConfig {
    getPageRenderer: (website: Website) => Observable<BookFrame>,
}

export class PageManager {
    pageIndex$: Observable<Dictionary<BookFrame>>
    pageList$: Observable<BookFrame[]>;
    atomizedSentences$: Observable<AtomizedSentence[]>;
    requestRenderPage$ = new ReplaySubject<Website>(1);

    constructor(
        private config: PageManagerConfig
    ) {
        this.pageIndex$ = this.requestRenderPage$.pipe(
            switchMap(page =>
                this.config.getPageRenderer(page)
            ),
            scan((acc: Dictionary<BookFrame>, page: BookFrame) => {
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