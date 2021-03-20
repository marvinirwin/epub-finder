import React from"react";

export interface TreeMenuNode {
    name: string;
    label: string;
    Component?: React.FunctionComponent;
    action?: () => void,
    LeftIcon?: React.FunctionComponent;
    moveDirectory?: boolean;
    hidden?: boolean;
    props?: React.HTMLProps<HTMLDivElement>;
}

