import {Observable, Subject} from "rxjs";
import {scan} from "rxjs/operators";

export interface Delta<T> {
    set: {[key: string]: T},
    remove: {[key: string]: T},
}

export interface Dict<T> {
    [key: string]: T
}

type DeltaScan<T> = { sourced: Dict<T>, delta: Delta<T> };

// Right now we over-write things in the map, perhaps we want to merge them
export class DeltaScanner<T> {
    appendDelta$ = new Subject<Delta<T>>();
    updates$: Observable<DeltaScan<T>>;
    constructor() {
        this.updates$ = this.appendDelta$.pipe(
            scan(({sourced}: DeltaScan<T>, delta: Delta<T>) => {
                Object.entries(delta.set).forEach(([key, value]) => {
                    // TODO maybe do some checking, whether we actually changed anything
                    sourced[key] = value;
                });
                Object.entries(delta.remove).forEach(([key, value]) => {
                    delete sourced[key];
                })
                return {sourced, delta}
            }, {sourced: {}, delta: {}} as DeltaScan<T>)
        )
    }
}
// Now where can we use this delta scanner?
// The most ideal case is on the textData$
// Tbh we should probably get the coldSubject to work first
// But we need testing for that
// Annoying.
// ColdSubject not necessary yet, this one is