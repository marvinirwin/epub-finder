import {BehaviorSubject} from "rxjs";
import {ProgressItem} from "./progress-item";

export class ProgressItemService {
    progressItems$ = new BehaviorSubject<Set<ProgressItem>>(new Set())
    newProgressItem() {
        return new ProgressItem(this)
    }
}

