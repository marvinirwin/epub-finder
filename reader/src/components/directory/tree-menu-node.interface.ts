import React from "react";
import {TreeMenuProps} from "./tree-menu.service";

export interface TreeMenuNode {
    name: string;
    label?: string;

    Component?: React.FunctionComponent;

    action?: () => void,
    // Inlien doesn't replace the entire listItem
    InlineComponent?: React.FunctionComponent;
    // I think replaceComponent does
    ReplaceComponent?: React.FunctionComponent;

    LeftIcon?: React.Component;
    moveDirectory?: boolean;
}

