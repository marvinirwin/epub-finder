import './declaration.d';
import "fontsource-noto-sans"
import 'jquery-ui-bundle';
import 'jquery-ui-bundle/jquery-ui.css';
import $ from 'jquery';
import React, {useEffect, useState, Fragment} from 'react';
import './App.css';
// @ts-ignore
import {render} from 'react-dom';
import 'react-toastify/dist/ReactToastify.css';
/* eslint import/no-webpack-loader-syntax:0 */
// @ts-ignore
import {FlashcardPopup} from "./components/FlashcardPopup";
import {useObs} from "./UseObs";
import {trie} from "./lib/Trie";
import {isChineseCharacter} from "./lib/worker-safe/Card";

import {AppSingleton, EditingCardClass, initializeApp, queryImages} from "./AppSingleton";
import {CssBaseline, GridList, GridListTile, TextField} from "@material-ui/core";
import {Dictionary} from 'lodash';
import {Main} from "./components/Main";
import {createMuiTheme, ThemeProvider} from '@material-ui/core/styles';
import blue from '@material-ui/core/colors/blue';
import {dark} from "@material-ui/core/styles/createPalette";
import {ICard} from "./lib/worker-safe/icard";

const darkTheme = createMuiTheme({
    palette: {
        type: 'dark',
    },
    typography: {
        fontFamily: '"Noto Sans", "Noto Sans CJK JP", sans-serif'
    }
});
darkTheme.spacing(2);

const queryParams = {};

export interface shutterResult {
    assets: {
        preview: {
            url: string;
        }
    }
}

// @ts-ignore
window.$ = $;

const CHAR_LIMIT = 5;

function windDownStringIntoTrie(currentSection: string[], t: trie<number>, i: number) {
    if (currentSection.length) {
        for (let j = 0; j < currentSection.length; j++) {
            const str = currentSection.slice(j).join('');
            t.insert(str, i + j);
        }
    }
}

function EditingCardComponent({editingCard}: { editingCard: EditingCardClass }) {
    const sources = useObs<string[] | undefined>(editingCard.imageSources)
    return <form className={'editing-card'}>
        <TextField label="Characters to Match" onChange={e => editingCard.matchChange$.next(e.target.value)}
                   variant="outlined"/>
        <TextField label="English" onChange={e => editingCard.english$.next([e.target.value])} variant="outlined"/>
        <GridList cellHeight={160} cols={3}>
            {sources && sources.map((src: string, i) => (
                <GridListTile key={i} cols={1}>
                    <img onClick={() => editingCard.photos$.next([src])} src={src} alt={''}/>
                </GridListTile>
            ))}
        </GridList>
    </form>
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
