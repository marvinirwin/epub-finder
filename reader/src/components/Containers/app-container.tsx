import {TreeMenuService} from "../../services/tree-menu.service";
import {useObservableState} from "observable-hooks";
import React, {useContext} from "react";
import uniqueBy from "@popperjs/core/lib/utils/uniqueBy";
import {TreeMenu} from "../TreeMenu/tree-menu.component";
import {Typography} from "@material-ui/core";
import {ManagerContext} from "../../App";
import {ImageSearchComponent} from "../ImageSearch/image-search.component";

export const AppContainer: React.FunctionComponent<{ treeMenuService: TreeMenuService<{}, any> }> = ({treeMenuService}) => {
    const m = useContext(ManagerContext);
    const allItems = useObservableState(treeMenuService.allItems$) || {};
    const selectedComponent = useObservableState(treeMenuService.selectedComponent$)
    const menuItemTree = useObservableState(treeMenuService.tree.updates$);
    const directoryPath = useObservableState(m.settingsService.directoryPath$) || []
    return <div className={'app-container'}>
        <ImageSearchComponent/>
        {
            menuItemTree?.sourced && <TreeMenu
                title={() => <Typography
                    ref={ref => m.introService.titleRef$.next(ref)}
                    variant='h6'>Language Trainer
                </Typography>
                }
                tree={menuItemTree.sourced}
                directoryPath={directoryPath}
                directoryChanged={directoryPath => m.settingsService.directoryPath$.next(directoryPath)}
                componentChanged={componentPath => {
                    m.settingsService.componentPath$.next(componentPath);
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