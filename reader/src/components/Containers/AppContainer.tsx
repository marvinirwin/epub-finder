import {TreeMenuService} from "../../services/tree-menu.service";
import {useObservableState} from "observable-hooks";
import React from "react";
import {SelectableMenuList} from "../DrawerMenu/SelectableMenuList";
import {MenuitemInterface} from "../DrawerMenu/menu-item.interface";

export const AppContainer: React.FunctionComponent<{ treeMenuService: TreeMenuService<MenuitemInterface, any> }> = ({treeMenuService}) => {
    const allItems = useObservableState(treeMenuService.allItems$) || {};
    const selectedItem = useObservableState(treeMenuService.selectedItem$);
    const currentComponent = useObservableState(treeMenuService.currentComponent$);
    const menuItemTree = useObservableState(treeMenuService.menuItems.updates$);
    const path = useObservableState(treeMenuService.path$) || []
    return <div className={'app-container'}>
        {
            menuItemTree?.sourced && <SelectableMenuList
                title={'Mandarin Trainer'}
                tree={menuItemTree.sourced}
                path={path}
                pathChanged={newPath => treeMenuService.path$.next(newPath)}
            />
        }
        <div className={'all-items-container'}>
            {Object.values(allItems)
                .map(({Component}, index) => <div
                        key={index}
                        className={'directory-item'}
                        style={{zIndex: Component === currentComponent ? 1 : 0}}>
                    {Component}
                    </div>
                )}
        </div>
    </div>
}