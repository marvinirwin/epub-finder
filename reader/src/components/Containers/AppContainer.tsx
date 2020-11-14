import {TreeMenuService} from "../../services/tree-menu.service";
import {useObservableState} from "observable-hooks";
import React from "react";
import {TreeMenu} from "../TreeMenu/TreeMenu";
import uniqueBy from "@popperjs/core/lib/utils/uniqueBy";
import {uniq} from "lodash";

export const AppContainer: React.FunctionComponent<{ treeMenuService: TreeMenuService<{}, any> }> = ({treeMenuService}) => {
    const allItems = useObservableState(treeMenuService.allItems$) || {};
    const selectedComponent = useObservableState(treeMenuService.selectedComponent$)
    const menuItemTree = useObservableState(treeMenuService.tree.updates$);
    const directoryPath = useObservableState(treeMenuService.directoryPath$) || []

    return <div className={'app-container'}>
        {
            menuItemTree?.sourced && <TreeMenu
                title={'Mandarin Trainer'}
                tree={menuItemTree.sourced}
                directoryPath={directoryPath}
                directoryChanged={directoryPath => treeMenuService.directoryPath$.next(directoryPath)}
                componentChanged={componentPath => treeMenuService.componentPath$.next(componentPath)}
                actionSelected={actionPath => treeMenuService.actionSelected$.next(actionPath)}
            />
        }
        <div className={'all-items-container'}>
            {
                uniqueBy(
                    Object.values(allItems)
                        .filter(menuNode => menuNode.Component),
                    menuNode => menuNode.Component
                ).map((item, index) => <div
                            key={index}
                            className={'directory-item'}
                            style={{zIndex: item.Component === selectedComponent?.Component ? 1 : 0}}>
                            {
                                item.Component && <item.Component/>
                            }
                        </div>
                    )}
        </div>
    </div>
}