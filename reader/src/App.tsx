import './declaration.d';
import "fontsource-noto-sans"
import React from 'react';
import './App.scss';
import 'react-toastify/dist/ReactToastify.css';
import {getManager} from "./AppSingleton";
import {CssBaseline} from "@material-ui/core";
import {Main} from "./components/Main";
import {ThemeProvider} from '@material-ui/core/styles';
import {GlobalDragOver} from "./components/global-drag-over.component";
import {AlertSnackbar} from "./components/alert-snackbar.component";
import {LoadingBackdrop} from "./components/loading-backdrop.component";
import {theme} from "./theme";
import {ActionModal} from "./components/action-modal/action-modal";

const urlParams = new URLSearchParams(window.location.search);

window.addEventListener("unhandledrejection", event => {
    console.warn(`UNHANDLED PROMISE REJECTION: ${event.reason}`);
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
});


const manager = getManager(urlParams.get('mode') || 'test')
export const ManagerContext = React.createContext(manager)

function App() {
    return <ThemeProvider theme={theme}>
            <ManagerContext.Provider value={manager}>
                {manager.modalService.modals().map(modal => <ActionModal navModal={modal}/>)}
                <LoadingBackdrop/>
                <AlertSnackbar/>
                <GlobalDragOver/>
                <CssBaseline/>
                <Main m={manager}/>
            </ManagerContext.Provider>
    </ThemeProvider>;
}

export default App;
