import React, {useEffect} from "react";
import {Manager} from "../lib/Manager";
import {NavigationPages} from "../lib/Util/Util";
import {useObservableState} from "observable-hooks";
import {HotKeyEvents, Hotkeys} from "../lib/HotKeyEvents";
import {AppDirectoryService} from "./Directory/app-directory-service";
import {AppContainer} from "./Containers/AppContainer";
import {TreeMenuService} from "../services/tree-menu.service";


export const FocusedElement = React.createContext<HTMLElement | Document | null>(null)
export const HotkeyContext = React.createContext<Partial<Hotkeys<string[]>>>({})

const treeMenuService = new TreeMenuService<any, {value: any}>();

export function Main({m}: { m: Manager }) {
    const currentPage = useObservableState(m.bottomNavigationValue$);
    useEffect(() => {
        m.inputManager.applyDocumentListeners(document);
        AppDirectoryService(m).subscribe(v => treeMenuService.tree.appendDelta$.next(v));
    }, [m]);


    const alertMessagesVisible = useObservableState(m.alertMessagesVisible$);
    const alertMessages = useObservableState(m.alertMessages$);

    const hotkeyHandler = useObservableState(m.inputManager.focusedElement$) || null;
    const hotkeyConfig = useObservableState(m.db.hotkeys$, {});
    const withDefaults = {...HotKeyEvents.defaultHotkeys(), ...hotkeyConfig};

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