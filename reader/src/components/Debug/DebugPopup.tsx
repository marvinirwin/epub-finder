import {Manager} from "../../lib/Manager";
import DebugDisplay from "./DebugDisplay";
import {MessageList} from "./MessageLlist";
import React, { Fragment } from "react";

export function DebugPopup({m}: { m: Manager }) {
    return <Fragment>
        <div className={'debug-display-container'}>
        </div>
    </Fragment>;
}