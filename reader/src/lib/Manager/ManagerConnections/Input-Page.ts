import {OpenBooks} from "../OpenBooks";
import {BrowserInputs} from "../BrowserInputs";
import {map, switchMap} from "rxjs/operators";
import {merge} from "rxjs";

export function InputPage(u: BrowserInputs, p: OpenBooks) {
/*
    p.bookFrames.updates$.pipe(
        switchMap(pageList => merge(
            ...pageList.map(p => p.frame.iframe$.pipe(map(({body}) => body))))
        ),
    ).subscribe((body: HTMLBodyElement) => {
        u.applyListeners(body)
    })
*/
}