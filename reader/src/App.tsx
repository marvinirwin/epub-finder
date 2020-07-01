import './declaration.d';
import "fontsource-noto-sans"
import $ from 'jquery';
import React, {useEffect, useState} from 'react';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import {AppSingleton, initializeApp} from "./AppSingleton";
import {CssBaseline} from "@material-ui/core";
import {Main} from "./components/Main";
import {createMuiTheme, ThemeProvider} from '@material-ui/core/styles';


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

export interface shutterResult {
    assets: {
        preview: {
            url: string;
        }
    }
}

function App() {
    const [appSingleton, setAppSingleton] = useState<AppSingleton | undefined>();
    useEffect(() => {
        initializeApp().then(s => setAppSingleton(s))
    }, [])
    const c = appSingleton ? <Main s={appSingleton}/> : <div>Initializing..</div>;
    return <ThemeProvider theme={darkTheme}>
        <CssBaseline/>
        {c}
    </ThemeProvider>;
}

export default App;
