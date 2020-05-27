import {BehaviorSubject, combineLatest, Observable, ReplaySubject, Subject} from "rxjs";
import {Dictionary} from "lodash";
import {map, share, withLatestFrom} from "rxjs/operators";
import Epub from 'epubjs';
import Spine from "epubjs/types/spine";
import {SpineItem} from "epubjs/types/section";
import Book from "epubjs/types/book";

export interface BookInstance {
    message: string;
    name: string;
    book: Book | undefined;
}

export class BookManager {
    bookDict$: BehaviorSubject<Dictionary<BookInstance>> = new BehaviorSubject<Dictionary<BookInstance>>({});
    currentBook$: ReplaySubject<BookInstance | undefined> = new ReplaySubject<BookInstance | undefined>(1)
    bookLoadUpdates$: Subject<BookInstance> = new Subject();
    spine$: ReplaySubject<Spine | undefined> = new ReplaySubject(1);
    spineItems$: ReplaySubject<SpineItem[] | undefined> = new ReplaySubject<SpineItem[] | undefined>(1);
    currentSpineItem$: ReplaySubject<SpineItem | undefined> = new ReplaySubject(1);
    bookList$: Observable<BookInstance[]>;

    constructor(bookNames: string[]) {
        this.bookList$ = this.bookDict$.pipe(map(d => Object.values(d)));
        this.spine$.pipe(map(s => {
            if (!s) return;
            const a: SpineItem[] = [];
            s.each((f: SpineItem) => {
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
        this.currentBook$.pipe(map(function (bookInstance: BookInstance | undefined): Spine | undefined {
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
        bookNames.forEach(n => this.loadBookInstance(n, n))
    }

    async loadBookInstance(path: string, name: string) {
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
}