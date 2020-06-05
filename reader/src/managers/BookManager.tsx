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



