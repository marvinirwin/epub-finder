import {merge, Observable, ReplaySubject, Subject} from "rxjs";
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
    addPage$ = new Subject<Website>();

    constructor(
        private config: PageManagerConfig
    ) {
        this.pageIndex$ = this.addPage$.pipe(
            switchMap(page => {
                    return this.config.getPageRenderer(page);
                }
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
                ...pageList.map(page => page.atomizedSentencesFromSrc$)
                ).pipe(map(flatten))
            )
        );

        this.pageList$.pipe(
            switchMap(pageList =>
                merge(...pageList.map(page => page.atomizedSentencesFromSrc$))
            ),
        ).subscribe(atomizedSentences => {
            PageManager.ApplyAtomizedSentenceListeners(atomizedSentences);
        })
    }

    public static ApplyAtomizedSentenceListeners(atomizedSentences: AtomizedSentence[]) {
        atomizedSentences.forEach(atomizedSentence => {
            const showEvents = ['mouseenter', 'focus'];
            const hideEvents = ['mouseleave', 'blur'];
            let sentenceHTMLElement = atomizedSentence.getSentenceHTMLElement();
            let popperHTMLElement = atomizedSentence.getPopperHTMLElement();
            if (!sentenceHTMLElement || !popperHTMLElement) {
                debugger;console.log();
            }
            try {
                createPopper(sentenceHTMLElement, popperHTMLElement, {
                    placement: 'top-start',
                    strategy: 'fixed'
                });
            } catch(e) {
                debugger;
                console.error(e);
            }

            const show = () => {
                popperHTMLElement.setAttribute('data-show', '');
            }
            const hide = () => {
                (popperHTMLElement as unknown as HTMLElement).removeAttribute('data-show');
            }

            showEvents.forEach(event => {
                sentenceHTMLElement.addEventListener(event, show);
            });

            hideEvents.forEach(event => {
                sentenceHTMLElement.addEventListener(event, hide);
            });
            InputManager.applySentenceElementSelectListener(atomizedSentence)
        });
    }
}