import React, {useEffect} from 'react'
import './declaration.d'
import 'fontsource-noto-sans'
import './App.scss'
import 'react-toastify/dist/ReactToastify.css'
import {getManager} from './AppSingleton'
import {CssBaseline} from '@material-ui/core'
import {Main} from './components/main'
import {ThemeProvider} from '@material-ui/core/styles'
import {GlobalDragOver} from './components/library/global-drag-over.component'
import {AlertSnackbar, GeneralMessageSnackbar,} from './components/snackbars/alert-snackbar.component'
import {LoadingBackdrop} from './components/library/loading-backdrop.component'
import {theme} from './theme'
import {ActionModal} from './components/modals/action-modal.component'
import {isSafari} from "./components/quiz/is.safari";
import {SafariNotSupported} from "./safari-not-supported.component";
import {Flowbite, DarkThemeToggle, CustomFlowbiteTheme} from 'flowbite-react';
import {PronunciationVideoContainer} from "./components/pronunciation-video/pronunciation-video-container.component";
import {useObservableState} from "observable-hooks";
import { useLocation } from 'react-router-dom'


const urlParams = new URLSearchParams(window.location.search)

window.addEventListener('unhandledrejection', (event) => {
    console.warn(`UNHANDLED PROMISE REJECTION: ${event.reason}`)
    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation()
})

const manager = getManager(urlParams.get('mode') || 'test')
export const ManagerContext = React.createContext(manager);


function App() {
    const m = manager;
    useEffect(() => {
        m.browserInputsService.applyDocumentListeners(document)
    }, [m])
    const selectedVideo = useObservableState(m.pronunciationVideoService.videoMetadata$);
    return (
        <Flowbite>
            <ThemeProvider theme={theme}>
                <ManagerContext.Provider value={manager}>
                    <CssBaseline>
                        {isSafari ? <SafariNotSupported/> : <>
                            {manager.modalService.modals().map((Modal) => (
                                <ActionModal key={Modal.id} navModal={Modal}>
                                    <Modal.CardContents/>
                                </ActionModal>
                            ))}
                            <LoadingBackdrop/>
                            <AlertSnackbar/>
                            <GeneralMessageSnackbar/>
                            {/* <SpeechRecognitionSnackbar/> */}
                            <GlobalDragOver/>
                            <Main m={manager}/>
                            {
                                selectedVideo &&
                                <div style={{position: 'fixed', zIndex: 2, top: 0, width: '100%'}}>
                                    <PronunciationVideoContainer m={m}/>
                                </div>
                            }
                        </>}
                    </CssBaseline>
                </ManagerContext.Provider>
            </ThemeProvider>
        </Flowbite>
    )
}

export default App
