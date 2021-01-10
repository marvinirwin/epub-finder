import './declaration.d';
import "fontsource-noto-sans"
import React, {useCallback} from 'react';
import './App.scss';
import 'react-toastify/dist/ReactToastify.css';
import {getManager} from "./AppSingleton";
import {Backdrop, CircularProgress, CssBaseline} from "@material-ui/core";
import {Main} from "./components/Main";
import {createMuiTheme, ThemeProvider} from '@material-ui/core/styles';
import {green, indigo} from "@material-ui/core/colors";
import {GlobalDragOver} from "./components/global-drag-over.component";
import {AlertSnackbar} from "./components/alert-snackbar.component";
import {LoadingBackdrop} from "./components/loading-backdrop.component";

const urlParams = new URLSearchParams(window.location.search);

window.addEventListener("unhandledrejection", event => {
    console.warn(`UNHANDLED PROMISE REJECTION: ${event.reason}`);
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
});

const theme = createMuiTheme({
    palette: {
        primary: indigo,
        secondary: green,
    },
    typography: {
        fontFamily: '"Noto Sans", "Noto Sans CJK JP", sans-serif'
    },

});
theme.spacing(3);

const manager = getManager(urlParams.get('mode') || 'test')
export const ManagerContext = React.createContext(manager)

function App() {
    return <ThemeProvider theme={theme}>
            <ManagerContext.Provider value={manager}>
                <LoadingBackdrop/>
                <AlertSnackbar/>
                <GlobalDragOver/>
                <CssBaseline/>
                <Main m={manager}/>
            </ManagerContext.Provider>
    </ThemeProvider>;
}

export default App;
