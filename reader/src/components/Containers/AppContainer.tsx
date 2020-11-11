import {TreeMenuService} from "../../services/tree-menu.service";
import {useObservableState} from "observable-hooks";
import React from "react";
import {MenuitemInterface, SelectableMenuList} from "../DrawerMenu/SelectableMenuList";

export const AppContainer: React.FunctionComponent<{ treeMenuService: TreeMenuService<MenuitemInterface, any> }> = ({treeMenuService}) => {
    const allItems = useObservableState(treeMenuService.allItems$) || {};
    const selectedItem = useObservableState(treeMenuService.selectedItem$);
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
                .map((item, index) => <div
                        key={index}
                        className={'directory-item'}
                        style={{zIndex: item === selectedItem ? 1 : 0}}>
                        { <item.Component/> }
                    </div>
                )}
        </div>
    </div>
}