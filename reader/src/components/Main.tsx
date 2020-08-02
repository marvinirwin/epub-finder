import {AppSingleton} from "../AppSingleton";
import {useObs} from "../lib/UseObs";
import React, {Fragment, useEffect} from "react";
import {makeStyles} from "@material-ui/core/styles";
import {BottomNav} from "./BottomNav";
import {PopupElements} from "./PopupElements";
import {Manager} from "../lib/Manager";
import {ReadingPage} from "./Pages/ReadingPage";
import {QuizPage} from "./Pages/QuizPage";
import {SettingsPage} from "./Pages/SettingsPage";
import {PageContainer} from "./PageContainer";
import {Dictionary} from "lodash";
import {ImageSelectPopup} from "./ImageSelectPopup";
import {PageRenderer} from "../lib/PageRenderer";
import {NavigationPages} from "../lib/Util/Util";
import { ScheduleTablePage } from "./Pages/ScheduleTablePage";


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
    },
    bookList: {
        display: 'flex',
        flexFlow: 'column nowrap',

    },
}));

function resolveCurrentComponent(item: NavigationPages | undefined, m: Manager) {
    switch (item) {
        case NavigationPages.QUIZ_PAGE:
            return <QuizPage m={m}/>
        case NavigationPages.TRENDS_PAGE:
            return <ScheduleTablePage m={m}/>
        case NavigationPages.READING_PAGE:
            return <ReadingPage m={m}/>
        case NavigationPages.SETTINGS_PAGE:
            return <SettingsPage m={m}/>
        default:
            return <ReadingPage m={m}/>
    }
}

export function Main({s}: { s: AppSingleton }) {
    const {m} = s;
    const classes = useStyles();
    const item = useObs(m.bottomNavigationValue$);
    const SelectedPage = resolveCurrentComponent(item, m);
    useEffect(() => {
        m.userInputManager.applyListeners(document.body);
    }, [m]);
    const pages = useObs<Dictionary<PageRenderer>>(m.pageManager.pageIndex$);
    const iframeVisible = item === NavigationPages.READING_PAGE;

    return <div>
        <div style={{
            position: 'absolute',
            height: '90vh',
            width: '100vw',
            top: iframeVisible ? 0 : '9000px'
        }}>
            {Object.values(pages || {}).map(page => <PageContainer m={m} key={page.name} rb={page}/>)}
        </div>
        <ImageSelectPopup m={m}/>
        <PopupElements m={m}/>
        <div style={{maxHeight: '90vh', minHeight: '90vh', height: '90vh', overflow: 'auto'}}>
            {SelectedPage}
        </div>
        <BottomNav m={m}/>
    </div>;
}