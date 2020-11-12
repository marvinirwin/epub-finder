import React, {useEffect} from "react";
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
import {Library} from "./Library/Library";
import {Hotkeys} from "../lib/HotKeyEvents";
import {AppDirectoryService} from "../services/app-directory-service";
import {AppContainer} from "./Containers/AppContainer";
import {TreeMenuService} from "../services/tree-menu.service";
import {MenuitemInterface} from "./DrawerMenu/SelectableMenuList";


export const FocusedElement = React.createContext<HTMLElement | Document | null>(null)
export const HotkeyContext = React.createContext<Partial<Hotkeys<string[]>>>({})

const treeMenuService = new TreeMenuService<MenuitemInterface, {value: MenuitemInterface}>();

export function Main({m}: { m: Manager }) {
    const currentPage = useObservableState(m.bottomNavigationValue$);
    useEffect(() => {
        m.inputManager.applyDocumentListeners(document);
        treeMenuService.tree.appendDelta$.next(AppDirectoryService(m));
    }, [m]);

    const readingBook = m.openedBooks.readingBook;
    const iframeVisible = currentPage === NavigationPages.READING_PAGE;
    const characterPageShows = currentPage === NavigationPages.QUIZ_PAGE;

    const alertMessagesVisible = useObservableState(m.alertMessagesVisible$);
    const alertMessages = useObservableState(m.alertMessages$);

    const hotkeyHandler = useObservableState(m.inputManager.focusedElement$) || null;
    const hotkeyConfig = useObservableState(m.db.hotkeys$, {});
    const withDefaults = {...m.hotkeyEvents.defaultHotkeys(), ...hotkeyConfig};

    return <HotkeyContext.Provider value={withDefaults}>
        <FocusedElement.Provider value={hotkeyHandler}>
            <AppContainer treeMenuService={treeMenuService}/>

            {/*
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
*/}
        </FocusedElement.Provider>
    </HotkeyContext.Provider>
}