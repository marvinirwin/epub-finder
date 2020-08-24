import {useObs} from "../lib/UseObs";
import React, {Fragment, useEffect} from "react";
import {makeStyles} from "@material-ui/core/styles";
import {BottomNav} from "./Nav/BottomNav";
import {Manager} from "../lib/Manager";
import {ReadingPage} from "./Pages/ReadingPage";
import {QuizPage} from "./Pages/QuizPage";
import {SettingsPage} from "./Pages/SettingsPage";
import {FrameContainer} from "./Frame/FrameContainer";
import {Dictionary, flatten} from "lodash";
import {ImageSelectPopup} from "./ImageSearch/ImageSelectPopup";
import {OpenBook} from "../lib/BookFrame/OpenBook";
import {NavigationPages} from "../lib/Util/Util";
import {ScheduleTablePage} from "./Pages/ScheduleTablePage";
import {useObservable, useObservableState} from "observable-hooks";
import {map} from "rxjs/operators";
import {ds_Dict, flattenTree} from "../lib/Util/DeltaScanner";


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

export function Main({m}: { m: Manager }) {
    const classes = useStyles();
    const item = useObservableState(m.bottomNavigationValue$);
    const SelectedPage = resolveCurrentComponent(item, m);
    useEffect(() => {
        m.inputManager.applyListeners(document.body);
    }, [m]);

    const [allBookFrames] = useObservableState<OpenBook[]>(
        () => m.openedBooksManager
            .openedBooks
            .updates$
            .pipe(
                map(({sourced}) => {
                    let readingFrames = sourced?.children?.['readingFrames'];
                    if (readingFrames) {
                        return flattenTree(readingFrames);
                    } else {
                        return [];
                    }
                })
            ),
        []
    );
    const iframeVisible = item === NavigationPages.READING_PAGE;

    return <div>
        <div style={{
            position: 'absolute',
            height: '90vh',
            width: '100vw',
            top: iframeVisible ? 0 : '9000px',
            overflow: 'hidden'
        }}>
            {allBookFrames.map(page => <FrameContainer m={m} key={page.name} rb={page}/>)}
        </div>
        <ImageSelectPopup m={m}/>
        <div style={{maxHeight: '90vh', minHeight: '90vh', height: '90vh', overflow: 'auto'}}>
            {SelectedPage}
        </div>
        <BottomNav m={m}/>
    </div>;
}