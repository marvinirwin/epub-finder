import {ToggleTranslate} from "../toggle-translate";
import React from "react";
import {TogglePinyin} from "../toggle-pinyin";
import {TreeMenuNode} from "../tree-menu-node.interface";

export function TogglePinyinNode(): TreeMenuNode {
    return {
        name: 'toggle-pinyin',
        LeftIcon: () => <TogglePinyin/>,
        label: 'Toggle Romanization'
    };
}