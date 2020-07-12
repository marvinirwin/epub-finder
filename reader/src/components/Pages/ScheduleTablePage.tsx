import {Manager} from "../../lib/Manager";
import React, { Fragment } from "react";

import ScheduleTable from "../ScheduleTable/ScheduleTable";
import QuizDialogContainer from "../Quiz/Popup";

export function ScheduleTablePage({m}: { m: Manager }) {
    return <Fragment>
        <ScheduleTable m={m}/>
        <QuizDialogContainer m={m}/>
    </Fragment>
}