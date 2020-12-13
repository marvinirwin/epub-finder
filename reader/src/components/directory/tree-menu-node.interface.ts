import React from "react";

export interface TreeMenuNode {
    name: string;
    label?: string;

    Component?: React.FunctionComponent;

    action?: () => void,
    // Inline doesn't replace the entire listItem
    InlineComponent?: React.FunctionComponent;
    // I think replaceComponent does
    ReplaceComponent?: React.FunctionComponent;

    LeftIcon?: React.FunctionComponent;
    moveDirectory?: boolean;
}

