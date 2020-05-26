import {Observable, ReplaySubject, Subject} from "rxjs";
import {FormControl, InputLabel, MenuItem, Select} from "@material-ui/core";
import React from "react";
import Spine from "epubjs/types/spine";
import {SpineItem} from "epubjs/types/section";
import {useObs} from "../../UseObs";
import {BookInstance} from "../../BookManager";

export function SpineItemMenu(
    {
        spine$,
        selectedSpineElement$
    }: {
        spine$: Observable<SpineItem[] | undefined>,
        selectedSpineElement$: ReplaySubject<SpineItem | undefined> }
        ) {
    const spine = useObs<SpineItem[] | undefined>(spine$);
    const selectedSpineElement = useObs<SpineItem | undefined>(selectedSpineElement$);
    return <FormControl style={{minWidth: '120'}}>
        <InputLabel>Current Page</InputLabel>
        <Select
            value={selectedSpineElement?.href}
            onChange={v => selectedSpineElement$.next(spine && spine.find(s => s.href === v.target.value))}
        >
            {spine && spine.map(s => <MenuItem value={s.href}>{s.href}</MenuItem>)}
        </Select>
    </FormControl>
}
export function BookMenu(
    {
        books$,
        selectedBook$
    }: {
        books$: Observable<BookInstance[] | undefined>,
        selectedBook$: ReplaySubject<BookInstance | undefined> }
) {
    const bookList = useObs<BookInstance[] | undefined>(books$);
    const selectedBook = useObs<BookInstance | undefined>(selectedBook$);
    return <FormControl style={{minWidth: '120'}}>
        <InputLabel>Current Book</InputLabel>
        <Select
            value={selectedBook?.name}
            onChange={v => selectedBook$.next(bookList && bookList.find(s => s.name === v.target.value))}
        >
            {bookList && bookList.map(s => <MenuItem value={s.name}>{s.name}</MenuItem>)}
        </Select>
    </FormControl>
}
