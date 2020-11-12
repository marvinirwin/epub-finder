// A tree menu is a path and a ds_Tree with a computed property selectdObject
import {combineLatest, Observable, ReplaySubject} from "rxjs";
import {DeltaScanner, ds_Dict, flattenTree} from "../lib/Tree/DeltaScanner";
import React from "react";
import {map, shareReplay} from "rxjs/operators";
import {ds_Tree, flattenTreeIntoDict, walkTree} from "./tree.service";

export type TreeMenuProps<T> = {value: T};

export interface TreeMenuNode<T, props extends TreeMenuProps<any>> {
    Component?: React.FunctionComponent<props>;
    Action?: () => void,
    value: T;
    name: string;
}

export class TreeMenuService<T, U extends TreeMenuProps<any>> {
    path$ = new ReplaySubject<string[]>(1);
    tree = new DeltaScanner<TreeMenuNode<T, U>>();
    pathIsInvalid$: Observable<boolean>;
    selectedItem$: Observable<TreeMenuNode<T, U> | undefined>;
    allItems$: Observable<ds_Dict<TreeMenuNode<T, U>>>;
    menuItems: DeltaScanner<T>;

    constructor() {
        this.path$.next([])
        const itemAtPath$: Observable<ds_Tree<TreeMenuNode<T, U>> | undefined> = combineLatest([
            this.path$,
            this.tree.updates$
        ]).pipe(
            map(([path, {sourced}]) => {
                if (!path.length) {
                    return sourced;
                }
                if (sourced) {
                    return walkTree<TreeMenuNode<T, U>>(sourced, ...path)
                }
            }),
            shareReplay(1)
        );

        this.pathIsInvalid$ = combineLatest([
            itemAtPath$,
            this.path$
        ]).pipe(
            map(([ itemAtPath, path] ) => !!itemAtPath && !!path.length)
        );

        this.selectedItem$ = itemAtPath$.pipe(
            map((itemAtPath) => itemAtPath?.value)
        );

        this.allItems$ = this.tree.updates$.pipe(
            flattenTreeIntoDict()
        );

        this.menuItems = this.tree.mapWith(v => v.value)
    }
}
