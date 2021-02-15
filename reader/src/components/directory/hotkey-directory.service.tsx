import {HotKeyEvents} from "../../lib/HotKeyEvents";
import {Manager} from "../../lib/Manager";
import React, {useContext} from "react";
import {orderBy} from "lodash";
import {ds_Tree} from "../../services/tree.service";
import {HotkeyDirectoryComponent} from "./hotkey-directory.component";
import {Hotkeys} from "../../lib/hotkeys/hotkeys.interface";
import {TreeMenuNode} from "./tree-menu-node.interface";


const hotkeyMenuNodeFactory = (
    m: Manager,
    action: keyof Hotkeys<any>,
) => ({
    name: action,
    label: action,
    InlineComponent: () => <HotkeyDirectoryComponent action={action} key={action}/>
})

export const EditableHotkeys = (hotkeys: Hotkeys<string[]>, m: Manager): TreeMenuNode[] => {
    return orderBy(Object.entries(hotkeys), ([action]) => action).map(([action, arr]) => {
        return hotkeyMenuNodeFactory(m, action as keyof Hotkeys<any>);
    })
}






/*
export const HotkeyDirectoryService = (m: Manager): ds_Tree<TreeMenuNode> => {
    return {
        nodeLabel: 'hotkeys',
        value: {
            name: 'hotkeys',
            label: 'Hotkeys',
            moveDirectory: true
        },
        children: Object.fromEntries(
            EditableHotkeys(HotKeyEvents.defaultHotkeys(), m).map(treeMenuNode => [
                treeMenuNode.name,
                    {
                        nodeLabel: treeMenuNode.label,
                        value: treeMenuNode
                    }
                ]
            )
        )
    }
}*/
