import {ToggleTranslate} from "../toggle-translate";
import React from "react";
import {TreeMenuNode} from "../tree-menu-node.interface";

export function ToggleTranslateNode(): TreeMenuNode {
    return {
        name: 'translate',
        LeftIcon: () => <ToggleTranslate/>,
        label: 'translate'
    };
}