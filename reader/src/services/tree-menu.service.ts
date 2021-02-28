// A tree menu is a path and a ds_Tree with a computed property selectdObject
import {combineLatest, Observable, ReplaySubject} from "rxjs";
import {map, shareReplay, withLatestFrom} from "rxjs/operators";
import {ds_Tree, flattenTreeIntoDict, walkTree} from "./tree.service";
import {TreeMenuNode} from "../components/directory/tree-menu-node.interface";
import {SettingsService} from "./settings.service";
import {DeltaScanner, ds_Dict} from "../lib/delta-scan/delta-scan.module";

export type TreeMenuProps<T> = { value: T };

export class TreeMenuService<T, U extends TreeMenuProps<any>> {
    selectedDirectory$: Observable<TreeMenuNode | undefined>;
    selectedComponentNode$: Observable<TreeMenuNode | undefined>;
    actionSelected$ = new ReplaySubject<string[]>(1);
    tree = new DeltaScanner<TreeMenuNode>();
    directoryIsInvalid$: Observable<boolean>;

    allItems$: Observable<ds_Dict<TreeMenuNode>>;

    /*
        menuItems: DeltaScanner<T>;
    */

    constructor({settingsService,}: { settingsService: SettingsService }) {
        const itemAtDirectoryPath$: Observable<ds_Tree<TreeMenuNode> | undefined> = this.itemAtPath$(
            settingsService.directoryPath$
                .pipe(map(str => str.split('.').filter(v => v)))
        );
        const componentAtActionPath$: Observable<ds_Tree<TreeMenuNode> | undefined> = this.itemAtPath$(
            settingsService.componentPath$
                .pipe(map(str => str.split('.').filter(v => v)))
        );

        this.directoryIsInvalid$ = combineLatest([
            itemAtDirectoryPath$,
            settingsService.directoryPath$
        ]).pipe(
            map(([itemAtPath, path]) =>
                !!itemAtPath && !!path.length
            )
        );

        this.selectedComponentNode$ = componentAtActionPath$.pipe(map(itemAtPath => itemAtPath?.value));
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
                const action = walkTree<TreeMenuNode>(sourced, ...actionPath)?.value?.action;
                if (action) {
                    action()
                }
            }
        })
    }

    private itemAtPath$(path$:
                            Observable<string[] | undefined>
                            | Observable<string[]>) {
        return combineLatest([
            path$,
            this.tree.updates$
        ]).pipe(
            map(([path, {sourced}]) => {
                if (!path?.length) {
                    return sourced;
                }
                if (sourced) {
                    return walkTree<TreeMenuNode>(sourced, ...path)
                }
            }),
            shareReplay(1)
        );
    }

}
