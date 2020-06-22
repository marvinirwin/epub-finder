import {AppSingleton} from "../AppSingleton";
import {useObs} from "../UseObs";
import React from "react";
import {makeStyles} from "@material-ui/core/styles";
import {BottomNav} from "./BottomNav";
import {PopupElements} from "./PopupElements";
import {Manager, NavigationPages} from "../lib/Manager";
import {ReadingPage} from "./Pages/ReadingPage";
import {TrendsPage} from "./Pages/TrendsPage";
import {QuizPage} from "./Pages/QuizPage";

window.addEventListener("dragover", function (e) {
    e.preventDefault();
}, false);
window.addEventListener("drop", function (e) {
    e.preventDefault();
}, false);

const useStyles = makeStyles((theme) => ({
    root: {
        flexFlow: 'column nowrap',
        '& > *': {
            borderRadius: 0
        },
        height: '100vh',
        width: '100vw',
        display: 'flex'
    },
    middle: {
        flexGrow: 1
    }
}));

function resolveCurrentComponent(item: NavigationPages | undefined, m: Manager) {
    switch (item) {
        case NavigationPages.QUIZ_PAGE:
            return <QuizPage m={m}/>
        case NavigationPages.TRENDS_PAGE:
            return <TrendsPage m={m}/>
        case NavigationPages.READING_PAGE:
            return <ReadingPage m={m}/>
        default:
            return <ReadingPage m={m}/>
    }
}

export function Main({s}: { s: AppSingleton }) {
    const {m} = s;
    const classes = useStyles();
    const item = useObs(m.bottomNavigationValue$);
    const SelectedPage = resolveCurrentComponent(item, m);

    return <div>
        <PopupElements m={m}/>
        <div style={{maxHeight: '90vh', minHeight: '90vh', overflow: 'auto'}}>
            {SelectedPage}
        </div>
        <BottomNav m={m}/>
    </div>;
}