import React, {CSSProperties, useEffect} from "react";
import {makeStyles} from "@material-ui/core/styles";
import {BottomNav} from "./Nav/BottomNav";
import {Manager} from "../lib/Manager";
import {ReadingPage} from "./Pages/ReadingPage";
import {QuizPage} from "./Pages/QuizPage";
import {SettingsPage} from "./Pages/SettingsPage";
import {ImageSelectPopup} from "./ImageSearch/ImageSelectPopup";
import {OpenBook} from "../lib/BookFrame/OpenBook";
import {NavigationPages} from "../lib/Util/Util";
import {ScheduleTablePage} from "./Pages/ScheduleTablePage";
import {useObservableState} from "observable-hooks";
import {map} from "rxjs/operators";
import {flattenTree} from "../lib/Util/DeltaScanner";
import {StaticFrame} from "./Frame/StaticFrame";
import {OpenedBook} from "../lib/Atomized/OpenedBook";
import {Alert} from "@material-ui/lab";
import {Snackbar} from "@material-ui/core";


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
        m.inputManager.applyBodyListeners(document.body);
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
    const characterPageShows = item === NavigationPages.QUIZ_PAGE;

    const alertMessagesVisible = useObservableState(m.alertMessagesVisible$);
    const alertMessages = useObservableState(m.alertMessages$);

    return <div style={{maxHeight: '100vh', maxWidth: '100vw', overflow: 'hidden'}}>
        <StaticFrame
            visible={characterPageShows}
            visibleStyle={{
                position: 'absolute',
                top: '35vh',
                height: '55vh',
                width: '100vw',
                overflow: 'hidden',
                zIndex: 1
            }}>
            <OpenedBook openedBook={m.quizCharacterManager.exampleSentencesFrame}/>
        </StaticFrame>
        {allBookFrames.map(page => <StaticFrame
                visible={iframeVisible}
                key={page.name}
                visibleStyle={{
                    position: 'absolute',
                    height: '90vh',
                    width: '100vw',
                    overflow: 'hidden',
                    zIndex: 1
                }}>
                <OpenedBook openedBook={page}/>
            </StaticFrame>
        )}
        <ImageSelectPopup m={m}/>
        <div style={{
            overflow: 'auto',
            height: '90vh',
        }}>
            {SelectedPage}
        </div>
        <Snackbar
            open={alertMessagesVisible}
            autoHideDuration={6000}
            onClose={e => m.alertMessagesVisible$.next(false)}>
            <div>
                {
                    (alertMessages || []).map(alertMessage =>
                        <Alert key={alertMessage} severity="error">
                            {alertMessage}
                        </Alert>
                    )
                }
            </div>
        </Snackbar>
        <BottomNav m={m}/>
    </div>;
}