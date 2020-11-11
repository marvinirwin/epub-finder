import React from "react";
import { Manager } from "../../lib/Manager";
import {OpenedBook} from "../../lib/Atomized/OpenedBook";
import {Paper} from "@material-ui/core";

export const Reading: React.FunctionComponent<{m: Manager}> = ({m}) => {
    const openedBook = m.openedBooks.readingBook;
    return <div className={'reading-container'}>
        <Paper className={'video'}>

        </Paper>
        <Paper className={'speech'}>

        </Paper>
        <Paper className={'card'}>

        </Paper>
        <OpenedBook openedBook={openedBook}/>
    </div>
}