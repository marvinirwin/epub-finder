import './declaration.d';
import "fontsource-noto-sans"
import 'jquery-ui-bundle';
import 'jquery-ui-bundle/jquery-ui.css';
import $ from 'jquery';
import React, {useEffect, useState, Fragment} from 'react';
import './App.css';
// @ts-ignore
import {sify} from 'chinese-conv';
import {render} from 'react-dom';
import 'react-toastify/dist/ReactToastify.css';
/* eslint import/no-webpack-loader-syntax:0 */
// @ts-ignore
import {FlashcardPopup} from "./lib/FlashcardPopup";
import {useObs} from "./UseObs";
import {trie} from "./lib/Trie";
import {isChineseCharacter} from "./lib/worker-safe/Card";

import {AppSingleton, EditingCardInInterface, initializeApp, queryImages} from "./AppSingleton";
import {CssBaseline, GridList, GridListTile, TextField} from "@material-ui/core";
import {ICard} from "./AppDB";
import {Dictionary} from 'lodash';
import {Main} from "./components/Main";
import {createMuiTheme, ThemeProvider} from '@material-ui/core/styles';
import blue from '@material-ui/core/colors/blue';
import {dark} from "@material-ui/core/styles/createPalette";

const darkTheme = createMuiTheme({
    palette: {
        type: 'dark',
    },
    typography: {
        fontFamily: '"Noto Sans", "Noto Sans CJK JP", sans-serif'
    }
});

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

function EditingCardComponent({editingCard}: { editingCard: EditingCardInInterface }) {
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

function annotateElements(
    target: string,
    c: Dictionary<ICard[]>,
    messageSender: (s: string) => void) {
    return new Promise((resolve, reject) => {
        let $iframe = $('iframe');
        messageSender(`Starting render`)
        let contents = $iframe.contents();
        let body = contents.find('body');
        const characters = body.text().normalize();
        /*
                const t = new trie<number>();
                let currentSection: string[] = [];
                for (let i = 0; i < characters.length; i++) {
                    const char = characters[i];
                    if (isChineseCharacter(char)) {
                        if (currentSection.length >= CHAR_LIMIT) {
                            // Insert into the trie all characters
                            t.insert(currentSection.join(''), i)
                            currentSection.splice(currentSection.length - 1, 1) // TODO this deletes the last, right?
                        } else {
                            currentSection.push(char);
                        }
                    } else {
                        windDownStringIntoTrie(currentSection, t, i);
                        currentSection = [];
                    }
                }
        */
        const root = $('<div/>');
        const popupElements: JQuery[] = [];
        let currentEl = $('<span/>');
        for (let i = 0; i < characters.length; i++) {
            const char = characters[i];
            const word = sify(char);
            const el = $('<span/>');
            el.text(word);
            if (isChineseCharacter(char)) {
                popupElements.push(el);
            }
            root.append(el);
        }
        debugger;
        body.children().remove();
        body.append(root);
        setTimeout(() => {
            messageSender(`Mounting flashcards`)
            popupElements.forEach(e => {
                let text = e.text();
                let t = c[text];
                if (t) {
                    e.addClass('hoverable')
                    let htmlElements = e.get(0);
                    render(<FlashcardPopup card={t[0]} text={text}
                                           getImages={async function (char: string): Promise<string[]> {
                                               const o = await queryImages(char, 4)
                                               return o.data.map(d => d.assets.preview.url);
                                           }}/>, htmlElements);
                }
            })
            messageSender(`Finished Render`)
            debugger;
            resolve()
        })
        body.append(`
                    <style>
.hoverable {
  background-color: lightyellow;
}
.hoverable:hover {
  background-color: lightgreen;
}
</style>
                    `)
    })
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
