import {OpenBookManager} from "../OpenBookManager";
import {InputManager} from "../InputManager";
import {map, switchMap} from "rxjs/operators";
import {merge} from "rxjs";

export function InputPage(u: InputManager, p: OpenBookManager) {
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