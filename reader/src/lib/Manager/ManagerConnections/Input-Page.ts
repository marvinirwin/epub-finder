import {PageManager} from "../PageManager";
import {InputManager} from "../InputManager";
import {switchMap} from "rxjs/operators";
import {merge} from "rxjs";

export function InputPage(u: InputManager, p: PageManager) {
    p.pageList$.pipe(
        switchMap(pageList => merge(...pageList.map(p => p.iframebody$))),
    ).subscribe(body => {
        u.applyListeners(body)
    })
}