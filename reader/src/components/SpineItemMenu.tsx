import {Observable, ReplaySubject, Subject} from "rxjs";
import {FormControl, InputLabel, MenuItem, Select} from "@material-ui/core";
import React from "react";
import Spine from "epubjs/types/spine";
import {useObs} from "../UseObs";
import {aSpineItem, BookInstance} from "../managers/BookManager";

export function SpineItemMenu(
    {
        spine$,
        selectedSpineElement$
    }: {
        spine$: Observable<aSpineItem[] | undefined>,
        selectedSpineElement$: ReplaySubject<aSpineItem | undefined> }
        ) {
    const spine = useObs<aSpineItem[] | undefined>(spine$);
    const selectedSpineElement = useObs<aSpineItem | undefined>(selectedSpineElement$);
    return <FormControl className={'form-control'}>
{/*
        <InputLabel>Current Page</InputLabel>
*/}
{/*
        <Select
            value={(selectedSpineElement?.href) || ''}
            onChange={v => selectedSpineElement$.next(spine && spine.find(s => s.href === v.target.value))}
        >
            {spine && spine.map(s => <MenuItem key={s.href} value={s.href}>{s.href}</MenuItem>)}
        </Select>
*/}
    </FormControl>
}
export function BookMenu(
    {
        books$,
        currentBook$
    }: {
        books$: Observable<BookInstance[] | undefined>,
        currentBook$: ReplaySubject<BookInstance | undefined> }
) {
    const bookList = useObs<BookInstance[] | undefined>(books$);
    const selectedBook = useObs<BookInstance | undefined>(currentBook$);
    return <FormControl className={'form-control'}>
        <InputLabel>Current Book</InputLabel>
        <Select
            value={(selectedBook?.name) || ''}
            onChange={v => currentBook$.next(bookList && bookList.find(s => s.name === v.target.value))}
        >
            {bookList && bookList.map(s => <MenuItem key={s.name} value={s.name}>{s.name}</MenuItem>)}
        </Select>
    </FormControl>
}
