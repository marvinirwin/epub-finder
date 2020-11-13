import {HotKeyEvents, Hotkeys} from "../../lib/HotKeyEvents";
import {TextField} from "@material-ui/core";
import {Manager} from "../../lib/Manager";
import {EditableHotkey} from "../Hotkeys/EditableHotkey";
import React, {useContext} from "react";
import {orderBy} from "lodash";
import {TreeMenuNode} from "../../services/tree-menu-node.interface";
import {ds_Tree} from "../../services/tree.service";
import {useObservableState} from "observable-hooks";


const hotkeyMenuNodeFactory = (
    m: Manager,
    action: keyof Hotkeys<any>,
) => ({
    name: action,
    label: action,
    InlineComponent: () => {
        const hotkeys = useObservableState(m.db.hotkeysWithDefaults$);
        const defaults = HotKeyEvents.defaultHotkeys();
        return <EditableHotkey action={action} keyCombo={(hotkeys || defaults)[action]} m={m}/>;
    }
})

export const EditableHotkeys = (hotkeys: Hotkeys<string[]>, m: Manager): TreeMenuNode[] => {
    return orderBy(Object.entries(hotkeys), ([action]) => action).map(([action, arr]) => {
        return hotkeyMenuNodeFactory(m, action as keyof Hotkeys<any>);
    })
}

export const HotkeyMenuTree = (m: Manager): ds_Tree<TreeMenuNode> => {
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
}