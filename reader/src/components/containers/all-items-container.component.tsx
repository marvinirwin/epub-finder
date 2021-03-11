import uniqueBy from "@popperjs/core/lib/utils/uniqueBy";
import React, {useContext} from "react";
import {ManagerContext} from "../../App";
import {useObservableState} from "observable-hooks";

export const AllItemsContainer: React.FC<React.HTMLProps<HTMLDivElement>> = ({...props}) => {
    const m = useContext(ManagerContext);
    const treeMenuService = m.treeMenuService;
    const allItems = useObservableState(treeMenuService.allItems$) || {};
    const selectedComponent = useObservableState(treeMenuService.selectedComponentNode$)
    return <div {...props}>
        {
            uniqueBy(
                Object.values(allItems)
                    .filter(menuNode =>
                        menuNode.Component &&
                        menuNode.name === selectedComponent?.name
                    ),
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
}