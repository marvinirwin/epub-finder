import './declaration.d';
import "fontsource-noto-sans"
import React, {useCallback} from 'react';
import './App.scss';
import 'react-toastify/dist/ReactToastify.css';
import {getManager} from "./AppSingleton";
import {CssBaseline} from "@material-ui/core";
import {Main} from "./components/Main";
import {createMuiTheme, ThemeProvider} from '@material-ui/core/styles';
import {green, indigo} from "@material-ui/core/colors";
import {DropzoneState, useDropzone} from "react-dropzone";

const urlParams = new URLSearchParams(window.location.search);

window.addEventListener("unhandledrejection", event => {
    console.warn(`UNHANDLED PROMISE REJECTION: ${event.reason}`);
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
});

const darkTheme = createMuiTheme({
    palette: {
        primary: indigo,
        secondary: green,
    },
    typography: {
        fontFamily: '"Noto Sans", "Noto Sans CJK JP", sans-serif'
    }
});
darkTheme.spacing(2);

const manager = getManager(urlParams.get('mode') || 'test')
export const ManagerContext = React.createContext(manager)
export const DropZoneContext = React.createContext<DropzoneState | undefined>(undefined);

function App() {
    const onDrop = useCallback(
        acceptedFiles => manager.droppedFilesService.droppedFiles$.next(acceptedFiles),
        []
    )

    const dropZone = useDropzone({onDrop});

    return <ThemeProvider theme={darkTheme}>
        <DropZoneContext.Provider value={dropZone}>
            <ManagerContext.Provider value={manager}>
                <CssBaseline/>
                <Main m={manager}/>
            </ManagerContext.Provider>
        </DropZoneContext.Provider>
    </ThemeProvider>;
}

export default App;
