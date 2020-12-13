import {Manager} from "../../lib/Manager";
import {ds_Tree} from "../../services/tree.service";
import React from "react";
import {TreeMenuNode} from "./tree-menu-node.interface";

export const ModeDirectory = (m: Manager): { [nodeLabel: string]: ds_Tree<TreeMenuNode> } => {
    return Object.fromEntries(
        [
        ].map(([name, Component]) => [
                name,
                {
                    nodeLabel: name,
                    value: {
                        name,
                        ReplaceComponent: Component
                    }
                }
            ]
        )
    )

}
