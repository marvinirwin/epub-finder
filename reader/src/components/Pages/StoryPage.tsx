import {Manager} from "../../lib/Manager";
import {useObservableState} from "observable-hooks";
import React, {Fragment} from "react";
import {SlidingTopWindows} from "./ReadingPage";
import {Conclusion} from "../Quiz/Conclusion";
import {Characters} from "../Quiz/Characters";
import {Paper} from "@material-ui/core";

export function StoryPage({m}: { m: Manager }) {
    const b = m.openedBooks;
    return <Paper>
        <Paper style={{display: 'flex', flexFlow: 'column nowrap'}}>
            <Paper style={{flexGrow: 1, maxHeight: '25%'}}>

            </Paper>
        </Paper>
    </Paper>
}
