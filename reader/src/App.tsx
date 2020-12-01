import './declaration.d';
import "fontsource-noto-sans"
import React from 'react';
import './App.scss';
import 'react-toastify/dist/ReactToastify.css';
import {getManager} from "./AppSingleton";
import {CssBaseline} from "@material-ui/core";
import {Main} from "./components/Main";
import {createMuiTheme, ThemeProvider} from '@material-ui/core/styles';
import {green, indigo} from "@material-ui/core/colors";

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
function App() {
    return <ThemeProvider theme={darkTheme}>
        <ManagerContext.Provider value={manager}>
            <CssBaseline/>
            <Main m={manager}/>
        </ManagerContext.Provider>
    </ThemeProvider>;
}

export default App;
