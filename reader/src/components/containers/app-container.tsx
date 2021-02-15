import {TreeMenuService} from "../../services/tree-menu.service";
import {useObservableState} from "observable-hooks";
import React, {useContext} from "react";
import uniqueBy from "@popperjs/core/lib/utils/uniqueBy";
import {TreeMenu} from "../tree-menu/tree-menu.component";
import {Typography} from "@material-ui/core";
import {ManagerContext} from "../../App";
import {ImageSearchComponent} from "../image-search/image-search.component";

export const AppContainer: React.FunctionComponent<{ treeMenuService: TreeMenuService<{}, any> }> = ({treeMenuService}) => {
    return <div className={'app-container'}>
        {
        }
    </div>
}