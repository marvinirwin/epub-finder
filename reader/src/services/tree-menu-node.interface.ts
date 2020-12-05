import React from "react";
import {TreeMenuProps} from "./tree-menu.service";

export interface TreeMenuNode {
    name: string;
    label: string;

    Component?: React.FunctionComponent;
    action?: () => void,
    InlineComponent?: React.FunctionComponent;
    ReplaceComponent?: React.FunctionComponent;

    LeftIcon?: React.Component;
    moveDirectory?: boolean;
}