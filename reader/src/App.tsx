import './declaration.d';
import "fontsource-noto-sans"
import React, {useState} from 'react';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import {getManager} from "./AppSingleton";
import {CssBaseline} from "@material-ui/core";
import {Main} from "./components/Main";
import {createMuiTheme, ThemeProvider} from '@material-ui/core/styles';
import {Manager} from "./lib/Manager";

const darkTheme = createMuiTheme({
    palette: {
        primary: {
            light: '#e6ffff',
            main: '#b3e5fc',
            dark: '#82b3c9',
            contrastText: '#000000',
        },
        secondary: {
            light: '#ffffff',
            main: '#fafafa',
            dark: '#c7c7c7',
            contrastText: '#000000',
        },
    },
    typography: {
        fontFamily: '"Noto Sans", "Noto Sans CJK JP", sans-serif'
    }
});
darkTheme.spacing(2);

const urlParams = new URLSearchParams(window.location.search);
urlParams.get('mode');

function App() {
    const [manager, setManager] = useState<Manager>(() => getManager(urlParams.get('mode') || 'test'));
    return <ThemeProvider theme={darkTheme}>
        <CssBaseline/>
        {manager ? <Main m={manager}/> : <div>Initializing..</div>}
    </ThemeProvider>;
}

export default App;
