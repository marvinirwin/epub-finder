// A tree menu is a path and a ds_Tree with a computed property selectdObject
import { combineLatest, Observable, ReplaySubject } from 'rxjs'
import {map, shareReplay, withLatestFrom} from 'rxjs/operators'
import { ds_Tree, flattenTreeIntoDict } from './tree.service'
import { TreeMenuNode } from '../components/app-directory/tree-menu-node.interface'
import { SettingsService } from './settings.service'
import { DeltaScanner, ds_Dict } from '../lib/delta-scan/delta-scan.module'

export type TreeMenuProps<T> = { value: T }

export class TreeMenuService<T, U extends TreeMenuProps<any>> {
    tree = new DeltaScanner<TreeMenuNode>()

    allItems$: Observable<ds_Dict<TreeMenuNode>>

    /*
        menuItems: DeltaScanner<T>;
    */

    constructor({ settingsService }: { settingsService: SettingsService }) {

        this.allItems$ = this.tree.updates$.pipe(flattenTreeIntoDict())
        /*
                this.menuItems = this.tree.mapWith(v => v.value);
        */

    }

}
