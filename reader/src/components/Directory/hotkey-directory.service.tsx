import {Hotkeys} from "../../lib/HotKeyEvents";
import {TextField} from "@material-ui/core";
import {Manager} from "../../lib/Manager";
import {EditableHotkey} from "../Hotkeys/EditableHotkey";
import React from "react";
import {orderBy} from "lodash";
import {TreeMenuNode} from "../../services/tree-menu-node.interface";
import {ds_Tree} from "../../services/tree.service";


const hotkeyMenuNodeFactory = (
    m: Manager,
    action: string,
    keys: string[]
) => ({
    name: action,
    label: action,
    InlineComponent: () => <EditableHotkey action={action} keyCombo={keys} m={m}/>
})

export const EditableHotkeys = (hotkeys: Hotkeys<string[]>, m: Manager): TreeMenuNode[] => {
    return orderBy(Object.entries(hotkeys), ([action]) => action).map(([action, arr]) => {
        return hotkeyMenuNodeFactory(m, action, arr);
    })
}

export const HotkeyMenuTree = (hotkeys: Hotkeys<string[]>, m: Manager): ds_Tree<TreeMenuNode> => {
    return {
        nodeLabel: 'hotkeys',
        value: {
            name: 'hotkeys',
            label: 'Hotkeys',
            moveDirectory: true
        },
        children: Object.fromEntries(
            EditableHotkeys(hotkeys, m).map(treeMenuNode => [
                treeMenuNode.name,
                    {
                        nodeLabel: treeMenuNode.label,
                        value: treeMenuNode
                    }
                ]
            )
        )
    }
}