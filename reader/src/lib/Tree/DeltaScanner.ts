import {Observable, ReplaySubject} from "rxjs";
import {map, scan, shareReplay, skip, take} from "rxjs/operators";
import {applyTreeDiff, ds_Tree, flattenTreeIntoDict} from "../../services/tree.service";
import {Named} from "../../../../server/src/shared/named.type";

export type ds_Dict<T, U extends string = string> = {
    [key in U]: T
}
export type IndexedByNumber<T> = Map<number, T>;

export type DeltaScan<T, U extends string = string> = {
    sourced: ds_Tree<T, U> | undefined,
    previousTree: ds_Tree<T, U> | undefined,
    delta: ds_Tree<T, U>
};
export type DeltaScanMapFunc<T, U> = (v: T) => U;
export type DeltaScanSubTreeFunc<T> = (v: ds_Tree<T>) => ds_Tree<T> | undefined;

// Right now we over-write things in the map, perhaps we want to merge them
export class DeltaScanner<T, U extends string = string> {
    // I dont think this needs to be a replaySubject, but lets see if this works
    appendDelta$ = new ReplaySubject<ds_Tree<T, U> | undefined>(1);
    updates$: Observable<DeltaScan<T, U>>;
    private newValues$: Observable<T[]>;

    constructor() {
        // @ts-ignore
        this.updates$ = this.appendDelta$.pipe(
            // @ts-ignore
            scan((scan: DeltaScan<T, U> | undefined, delta: ds_Tree<T, U> | undefined) => {
                    if (!scan)
                        return {
                            sourced: delta,
                            delta
                        } as DeltaScan<T, U>;

                    const sourced = applyTreeDiff(scan.sourced, delta);
                    return {
                        sourced: sourced,
                        previousTree: scan.sourced,
                        delta
                    } as DeltaScan<T, U>;
                },
                undefined
            ),
            shareReplay(1)
        );

        this.newValues$ = this.updates$.pipe(
            map(({sourced, delta}) => {
                return flattenTree(delta, [], n => !n.delete);
            }),
            shareReplay(1)
        )
    }

    mapWith<U>(mapFunc: DeltaScanMapFunc<T, U>): DeltaScanner<U> {
        const derivedTree = new DeltaScanner<U>();
        this.updates$.pipe(
            take(1),
        ).subscribe(({sourced}) => {
            if (sourced) {
                derivedTree.appendDelta$.next(
                    MapTree(sourced, mapFunc)
                )
            }
        });
        this.updates$.pipe(
            skip(1),
        ).subscribe(({delta}) => {
            derivedTree.appendDelta$.next(
                MapTree(delta, mapFunc)
            )
        })
        return derivedTree;
    }

    flatUpdates(): Observable<T[]> {
        return this.updates$.pipe(
            map(({sourced}) => flattenTree(sourced)),
            shareReplay(1)
        )
    }

    subTree(subTreeFunc: DeltaScanSubTreeFunc<T>): DeltaScanner<T> {
        const derivedTree = new DeltaScanner<T>();
        this.updates$.subscribe(({sourced}) => {
            if (sourced) {
                const newSubTree = subTreeFunc(sourced);
                if (newSubTree) {
                    newSubTree.newTree = true;
                }
                derivedTree.appendDelta$.next(newSubTree);
            }
            derivedTree.appendDelta$.next(sourced);
        })
        return derivedTree;
    }
}

export class NamedDeltaScanner<T extends Named, U extends string = string> extends DeltaScanner<T, U> {
    dict$: Observable<ds_Dict<T>>

    constructor() {
        super();
        this.dict$ = this.updates$.pipe(
            flattenTreeIntoDict(undefined),
            shareReplay(1)
        )
    }
}

function MapTree<T, U>(node: ds_Tree<T>, mapFunc: DeltaScanMapFunc<T, U>): ds_Tree<U> {
    const newChildren = Object.fromEntries(
        Object.entries(node.children || {})
            .map(
                ([nodeLabel, child]) => {
                    return [
                        nodeLabel,
                        MapTree(child, mapFunc)
                    ]
                }
            )
    );
    if (node.hasOwnProperty('value')) {
        const value = mapFunc(node.value as T);
        return {
            nodeLabel: node.nodeLabel,
            children: newChildren,
            value
        }
    } else {
        // @ts-ignore
        return {
            nodeLabel: node.nodeLabel,
            children: newChildren,
        } as ds_Tree<T>
    }
}

export function flattenTree<T, U extends string = string>(
    tree: ds_Tree<T, U> | undefined,
    a: T[] = [],
    filter?: (v: ds_Tree<T, U>) => boolean
): T[] {
    if (!tree) {
        return a;
    }
    if (filter && !filter(tree)) {
        return a;
    }
    if (tree.hasOwnProperty('value')) {
        if (!tree.value) {
            throw new Error("Tree has no value")
        }
        a.push(tree.value as T);
    }
    Object.values(tree.children || {}).forEach(child => flattenTree(child, a, filter))
    return a;
}

export function getElementByKeyPath<T, U extends string = string>(tree: ds_Tree<T, U>, keyPath: U[] = []): T {
    let n: ds_Tree<T> = tree;
    const i = 0;
    while (i < keyPath.length) {
        if (!n?.children) {
            throw new Error(`Could not follow keypath ${keyPath.join(',')}`)
        }
        n = n.children[keyPath[i]];
    }
    return n.value as T;
}

export function getDeletedValues<T>(tree: ds_Tree<T> | undefined, delta: ds_Tree<T>, a: T[] = []): T[] {
    if (delta.delete) {
        if (tree) {
            a.push(...flattenTree(tree));
        }
    }
    if (delta.children) {
        Object.entries(delta.children)
            .forEach(([key, child]) =>
                getDeletedValues(
                    tree?.children?.[key],
                    // @ts-ignore
                    delta.children[key] as ds_Tree<T>,
                    a
                )
            );
    }
    return a;
}

