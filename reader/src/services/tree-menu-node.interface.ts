import React from "react";
import {TreeMenuProps} from "./tree-menu.service";

export interface TreeMenuNode<T, props extends TreeMenuProps<any>> {
    Component?: React.FunctionComponent;
    action?: () => void,
    value: T;
    name: string;

    label: string;
    key: string;
    leftIcon?: string;
    moveDirectory: boolean;
}