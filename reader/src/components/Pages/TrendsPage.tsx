import {Manager} from "../../lib/Manager";
import {useObs} from "../../lib/Worker/UseObs";
import React, { Fragment } from "react";
import WordCountTable from "../WordCountTable";
import QuizDialogContainer from "../QuizPopup";

export function TrendsPage({m}: { m: Manager }) {
    return <Fragment>
        <WordCountTable m={m}/>
        <QuizDialogContainer m={m}/>
    </Fragment>
}