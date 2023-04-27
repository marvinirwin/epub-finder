import {BehaviorSubject, combineLatest, Observable} from 'rxjs'
import { ProgressItem } from './progress-item'
import {map, switchMap} from "rxjs/operators";

export class ProgressItemService {
    progressItems$ = new BehaviorSubject<Set<ProgressItem>>(new Set())
    progressItemText$: Observable<string[]>
    constructor() {
        this.progressItemText$ = this.progressItems$.pipe(
            switchMap(itemSet => combineLatest(Array.from(itemSet).map(item => item.text$))),
            map(texts => texts.filter(text => text))
        )
    }
    newProgressItem() {
        return new ProgressItem(this)
    }
}
