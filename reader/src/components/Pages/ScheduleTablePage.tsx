import {Manager} from "../../lib/Manager";
import React, { Fragment } from "react";

import ScheduleTable from "../ScheduleTable/ScheduleTable";

export function ScheduleTablePage({m}: { m: Manager }) {
    return <Fragment>
        <ScheduleTable m={m}/>
    </Fragment>
}