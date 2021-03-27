import React, { Fragment } from "react";
import {ProgressItem} from "./progress-item";
import {useObservableState} from "observable-hooks";

export const ProgressItemComponent: React.FC<{ progressItem: ProgressItem }> = ({progressItem}) => {
    const t = useObservableState(progressItem.text$) || '';
    return <Fragment>{t}</Fragment>
}