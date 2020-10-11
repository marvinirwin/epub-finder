import React, {useEffect} from "react";
import {makeStyles} from "@material-ui/core/styles";
import {BottomNav} from "./Nav/BottomNav";
import {Manager} from "../lib/Manager";
import {ReadingPage} from "./Pages/ReadingPage";
import {QuizPage} from "./Pages/QuizPage";
import {SettingsPage} from "./Pages/SettingsPage";
import {ImageSelectPopup} from "./ImageSearch/ImageSelectPopup";
import {NavigationPages} from "../lib/Util/Util";
import {ScheduleTablePage} from "./Pages/ScheduleTablePage";
import {useObservableState} from "observable-hooks";
import {StaticFrame} from "./Frame/StaticFrame";
import {OpenedBook} from "../lib/Atomized/OpenedBook";
import {Alert} from "@material-ui/lab";
import {Snackbar} from "@material-ui/core";
import { Video } from "./Video";
import {LibraryPage} from "./Pages/LibraryPage";


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
    const currentPage = useObservableState(m.bottomNavigationValue$);
    useEffect(() => {
        m.inputManager.applyDocumentListeners(document);
    }, [m]);

    const readingBook = m.openedBooks.readingBook;
    const iframeVisible = currentPage === NavigationPages.READING_PAGE;
    const characterPageShows = currentPage === NavigationPages.QUIZ_PAGE;

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
            <OpenedBook openedBook={m.quizCharacterManager.exampleSentencesBook}/>
        </StaticFrame>

        <StaticFrame
            visible={iframeVisible}
            visibleStyle={{
                position: 'absolute',
                height: '90vh',
                width: '100vw',
                overflow: 'hidden',
                zIndex: 1
            }}
        >
            <OpenedBook openedBook={readingBook}/>
        </StaticFrame>
        <ImageSelectPopup m={m}/>
        <div style={{
            overflow: 'auto',
            height: '90vh',
        }}>
            {currentPage === NavigationPages.QUIZ_PAGE && <QuizPage m={m}/>}
            {currentPage === NavigationPages.TRENDS_PAGE && <ScheduleTablePage m={m}/>}
            {(currentPage === NavigationPages.READING_PAGE || !currentPage) && <ReadingPage m={m}/>}
            {currentPage === NavigationPages.SETTINGS_PAGE && <SettingsPage m={m}/>}
            {currentPage === NavigationPages.LIBRARY_PAGE && <LibraryPage m={m}/>}
        </div>
        <Video m={m}/>
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