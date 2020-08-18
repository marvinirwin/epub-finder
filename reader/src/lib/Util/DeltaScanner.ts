import {Observable, Subject} from "rxjs";
import {scan} from "rxjs/operators";

export interface Delta<T> {
    set?: DeltaScannerDict<DeltaScannerValueNode<T>>,
    remove?: DeltaScannerDict<DeltaScannerDeleteNode<T>>,
}

export interface DeltaScannerDict<T> {
    [key: string]: T
}

export interface DeltaScannerValueNode<T> {
    value: T;
    children?: DeltaScannerDict<DeltaScannerValueNode<T>>
}

export interface DeltaScannerDeleteNode<T> {
    delete: boolean;
    children?: DeltaScannerDict<DeltaScannerDeleteNode<T>>
}


/**
 * Maybe I should return a tree of deltas once I apply
 * Not now though
 * @param oldTree
 * @param newTree
 */
function mergeTreeIntoAnother<T>(oldTree: DeltaScannerValueNode<T>, newTree: DeltaScannerValueNode<T>) {
    oldTree.value = newTree.value;
    // I could do it by returing new Nodes, but that might be slow?
    // Either way is pretty easy
    const newTreeChildren = newTree.children || {};
    const oldTreeChildren = oldTree.children || {};
    Object.entries(newTreeChildren).forEach(([key, node]) => {
        // Assert the child exists, this part wouldn't exist if we were doign the new instantiating way, but screw it
        if (!oldTreeChildren[key]) {
            oldTreeChildren[key] = {value: node.value, children: {}};
        }
        mergeTreeIntoAnother(oldTreeChildren[key], newTreeChildren[key])
    })
}

/**
 * Oh, we cannot delete from inside the recursive function, lets do the returning
 * Ha ha oh wow this function is a hybrid
 * @param oldTree
 * @param newTree
 */
function mergeDeleteTreeIntoAnother<T>(oldTree: DeltaScannerValueNode<T>, newTree: DeltaScannerDeleteNode<T>) {
    if (newTree.delete) {
        return undefined;
    }
    const newTreeChildren = newTree.children || {};
    const oldTreeChildren = oldTree.children || {};
    Object.entries(newTreeChildren).forEach(([key, node]) => {
        // Assert the child exists, this part wouldn't exist if we were doign the new instantiating way, but screw it
        if (oldTreeChildren[key]) {
            const v = mergeDeleteTreeIntoAnother(oldTreeChildren[key], newTreeChildren[key]);
            if (v) {
                oldTreeChildren[key] = v
            }
        }
    });
    return oldTree;
}

export type DeltaScan<T> = { sourced: DeltaScannerDict<DeltaScannerValueNode<T>>, delta: Delta<T> };

// Right now we over-write things in the map, perhaps we want to merge them
export class DeltaScanner<T> {
    appendDelta$ = new Subject<Delta<T>>();
    updates$: Observable<DeltaScan<T>>;

    constructor() {
        this.updates$ = this.appendDelta$.pipe(
            scan(({sourced}: DeltaScan<T>, delta: Delta<T>) => {
                Object.entries(delta.set || {}).forEach(([key, value]) => {
                    if (!sourced[key]) sourced[key] = {value: value.value};
                    mergeTreeIntoAnother(sourced[key], value)
                });
                Object.entries(delta.remove || {}).forEach(([key, value]) => {
                    // Now to make them delete nodes
                    mergeDeleteTreeIntoAnother(sourced[key], value)
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