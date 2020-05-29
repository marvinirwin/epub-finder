import {BehaviorSubject, combineLatest, Observable, ReplaySubject, Subject} from "rxjs";
import {Dictionary} from "lodash";
import {map, share, withLatestFrom} from "rxjs/operators";
import Epub from 'epubjs';
import Spine from "epubjs/types/spine";
import Book from "epubjs/types/book";

export interface BookInstance {
    message: string;
    name: string;
    book: aBook | undefined;
}

export class BookManager {
    bookDict$: BehaviorSubject<Dictionary<BookInstance>> = new BehaviorSubject<Dictionary<BookInstance>>({});
    currentBook$: ReplaySubject<BookInstance | undefined> = new ReplaySubject<BookInstance | undefined>(1)
    bookLoadUpdates$: Subject<BookInstance> = new Subject();
    spine$: ReplaySubject<aSpine | undefined> = new ReplaySubject(1);
    spineItems$: ReplaySubject<aSpineItem[] | undefined> = new ReplaySubject<aSpineItem[] | undefined>(1);
    currentSpineItem$: ReplaySubject<aSpineItem | undefined> = new ReplaySubject(1);
    bookList$: Observable<BookInstance[]>;

    constructor(bookNames: string[]) {
        this.bookList$ = this.bookDict$.pipe(map(d => Object.values(d)));
        this.spine$.pipe(map(s => {
            if (!s) return;
            const a: aSpineItem[] = [];
            s.each((f: aSpineItem) => {
                a.push(f);
            })
            return a;
        })).subscribe(v => {
                this.spineItems$.next(v);
            }
        );

        this.bookLoadUpdates$.subscribe(v => {
            this.bookDict$.next({
                ...this.bookDict$.getValue(),
                [v.name]: v
            })
        });
        this.currentBook$.pipe(map(function (bookInstance: BookInstance | undefined): aSpine | undefined {
            if (bookInstance) {
                if (bookInstance.book) {
                    return bookInstance.book.spine
                }
            }
            return undefined
        })).subscribe(this.spine$);

        this.spineItems$.pipe(withLatestFrom(this.currentSpineItem$)).subscribe(([spineItems, currentItem]) => {
            if (!spineItems) {
                this.currentSpineItem$.next(undefined);
                return;
            }
            if (!currentItem || !spineItems.find(i => i.href === currentItem.href)) {
                this.currentSpineItem$.next(spineItems[0])
                return;
            }
        })

        combineLatest(this.bookList$, this.currentBook$).subscribe(([bookList, currentBook]) => {
            if (!currentBook?.book) {
                const f = bookList.find((v) => v.book);
                if (f) this.currentBook$.next(f);
            }
        });

        this.currentBook$.next(undefined);
        this.currentSpineItem$.next(undefined);
        this.makeSimpleText(`a tweet`, `
        May 26 日本农民是世界上最富有最幸福的农民，日本农村宛如仙境，生活质量要高于城市。无论是物质生活还是精神生活，农村更优于城市，这是为了让那些生活在大城市的人，有一个可以留恋和返璞归真的世外桃源。农民有独立的别墅和一大片土地，收入远高于国家公务员，而中国的广大农民却是被剥削的底层身份象征。 
        
        May 23 共产党的承诺能相信吗？ 当初承诺香港一国两制五十年不变，五十年后更不会变，到今年为止二十三年还不到就变了？ 当初同意一九九七年香港回归以后二十年过渡期，二〇一七年实现普选，为什么不兑现承诺
        `)
    }

    async loadEbookInstance(path: string, name: string) {
        this.bookLoadUpdates$.next({
            name,
            book: undefined,
            message: `Loading ${name} from ${path}`
        });
        const book: Book = Epub(path);
        await book.ready
        this.bookLoadUpdates$.next({
            name,
            book,
            message: `Loaded ${name}`
        });
    }


    makeSimpleText(name: string, text: string) {
        this.bookLoadUpdates$.next({
            name,
            book: {
                renderTo(e: HTMLElement, options: { [p: string]: any }): aRendition {
                    return {
                        display: async s => {
                            debugger;
                            const iframe = $(`
                                <iframe style="width: 100%; height: 100%; font-family: sans-serif">
                                </iframe>`
                                )
                            ;
                            iframe.appendTo(e);
                            let htmlElements = $(`<p>${text}</p>`);
                            // @ts-ignore
                            let target: JQuery<HTMLElement> = iframe.contents().find('body');
                            htmlElements.appendTo(target);
                        }
                    }
                },
                spine: {
                    each: cb => cb({href: ''})
                }
            },
            message: `Created simple text source ${name}`
        });
    }
}

export interface aBook {
    renderTo(e: HTMLElement, options: { [key: string]: any }): aRendition

    spine: aSpine;
}

export interface aRendition {
    display: (e: string) => Promise<any>;
}

export interface aSpine {
    each(...args: any[]): any;
}

export interface aSpineItem {
    href: string;
}



