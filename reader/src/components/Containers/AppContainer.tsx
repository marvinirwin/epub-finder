import {TreeMenuService} from "../../services/tree-menu.service";
import {useObservableState} from "observable-hooks";
import React, {useContext} from "react";
import uniqueBy from "@popperjs/core/lib/utils/uniqueBy";
import {TreeMenu} from "../TreeMenu/tree-menu.component";
import {Typography} from "@material-ui/core";
import {ManagerContext} from "../../App";

export const AppContainer: React.FunctionComponent<{ treeMenuService: TreeMenuService<{}, any> }> = ({treeMenuService}) => {
    const allItems = useObservableState(treeMenuService.allItems$) || {};
    const selectedComponent = useObservableState(treeMenuService.selectedComponent$)
    const menuItemTree = useObservableState(treeMenuService.tree.updates$);
    const directoryPath = useObservableState(treeMenuService.directoryPath$) || []
    const m = useContext(ManagerContext);

    return <div className={'app-container'}>
        {
            menuItemTree?.sourced && <TreeMenu
                title={() => <Typography
                    ref={ref => m.introService.titleRef$.next(ref)}
                    variant='h6'>Language Trainer
                </Typography>
                }
                tree={menuItemTree.sourced}
                directoryPath={directoryPath}
                directoryChanged={directoryPath => treeMenuService.directoryPath$.next(directoryPath)}
                componentChanged={componentPath => {
                    treeMenuService.componentPath$.next(componentPath);
                }}
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
                        style={{
                            zIndex: item.name === selectedComponent?.name ? 1 : 0,

                        }}>
                        {
                            item.Component && <item.Component/>
                        }
                    </div>
                )}
        </div>
    </div>
}