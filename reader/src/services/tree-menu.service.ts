// A tree menu is a path and a ds_Tree with a computed property selectdObject
import {combineLatest, Observable, ReplaySubject} from "rxjs";
import {DeltaScanner, ds_Dict} from "../lib/Tree/DeltaScanner";
import {map, shareReplay, withLatestFrom} from "rxjs/operators";
import {ds_Tree, flattenTreeIntoDict, walkTree} from "./tree.service";
import {TreeMenuNode} from "./tree-menu-node.interface";

export type TreeMenuProps<T> = { value: T };

export class TreeMenuService<T, U extends TreeMenuProps<any>> {
    directoryPath$ = new ReplaySubject<string[]>(1);
    componentPath$ = new ReplaySubject<string[] | undefined>(1);
    selectedDirectory$: Observable<TreeMenuNode<T, U> | undefined>;
    selectedComponent$: Observable<TreeMenuNode<T, U> | undefined>;
    actionSelected$ = new ReplaySubject<string[]>(1);
    tree = new DeltaScanner<TreeMenuNode<T, U>>();
    directoryIsInvalid$: Observable<boolean>;

    allItems$: Observable<ds_Dict<TreeMenuNode<T, U>>>;
/*
    menuItems: DeltaScanner<T>;
*/

    constructor() {
        this.directoryPath$.next([])
        this.componentPath$.next([])
        const itemAtDirectoryPath$: Observable<ds_Tree<TreeMenuNode<T, U>> | undefined> = this.itemAtPath$(this.directoryPath$);
        const componentAtActionPath$: Observable<ds_Tree<TreeMenuNode<T, U>> | undefined> = this.itemAtPath$(this.componentPath$);

        this.directoryIsInvalid$ = combineLatest([
            itemAtDirectoryPath$,
            this.directoryPath$
        ]).pipe(
            map(([itemAtPath, path]) =>
                !!itemAtPath && !!path.length
            )
        );

        this.selectedComponent$ = componentAtActionPath$.pipe(map(itemAtPath => itemAtPath?.value));
        this.selectedDirectory$ = itemAtDirectoryPath$.pipe(map(itemAtPath => itemAtPath?.value));

        this.allItems$ = this.tree.updates$.pipe(
            flattenTreeIntoDict()
        );
/*
        this.menuItems = this.tree.mapWith(v => v.value);
*/

        this.actionSelected$.pipe(
            withLatestFrom(this.tree.updates$)
        ).subscribe(([actionPath, {sourced}]) => {
            if (sourced) {
                const action = walkTree<TreeMenuNode<T, U>>(sourced, ...actionPath)?.value?.action;
                if (action) {
                    action()
                }
            }
        })
    }

    private itemAtPath$(path$:
                        ReplaySubject<string[] | undefined>
                        | ReplaySubject<string[]>) {
    return combineLatest([
            path$,
            this.tree.updates$
        ]).pipe(
            map(([path, {sourced}]) => {
                if (!path?.length) {
                    return sourced;
                }
                if (sourced) {
                    return walkTree<TreeMenuNode<T, U>>(sourced, ...path)
                }
            }),
            shareReplay(1)
        );
    }

}
