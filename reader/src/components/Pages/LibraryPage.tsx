import {Manager} from "../../lib/Manager";
import {useObservableState} from "observable-hooks";
import React, {Fragment} from "react";
import {SlidingTopWindows} from "./ReadingPage";
import {Conclusion} from "../Quiz/Conclusion";
import {Characters} from "../Quiz/Characters";
import {Paper, Button, Input, TextField} from "@material-ui/core";
import {flattenTreeIntoDict, Named} from "../../lib/Manager/OpenBooks";
import {difference} from 'lodash';
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import {ds_Dict} from "../../lib/Util/DeltaScanner";
import {OpenBook} from "../../lib/BookFrame/OpenBook";
import {CustomDocument, Website} from "../../lib/Website/Website";
import {interpolateSimpleCustomDoc} from "../../lib/Manager/Library";

export interface NamedObjectParams<T extends Named> {
    listObjects: T[] | ds_Dict<T>;
    onSelect: (v: T) => void
}

export const NamedObjectList = <T extends Named>({listObjects, onSelect}: NamedObjectParams<T>) => {
    debugger;console.log();
    return <List dense={true}>
        {
            Object.values(listObjects).map(libraryBook => {
                return <ListItem
                    key={libraryBook.name}
                    button>
                    <ListItemText primary={libraryBook.name}
                                  onClick={() => onSelect(libraryBook)}/>
                </ListItem>;
            })
        }
    </List>;
}


export function LibraryPage({m}: { m: Manager }) {
    const openBooks = useObservableState(m.openedBooks.sourceBooks$);
    const builtInBooks = useObservableState(m.library.builtInBooks$.dict$) || {};
    const customBooks = useObservableState(m.library.customBooks$.dict$) || {};
    const simpleText = useObservableState(m.library.simpleBook$.text$) || '';
    const simpleName = useObservableState(m.library.simpleBook$.name$) || '';
    const rawText = useObservableState(m.library.rawBook$.text$) || '';
    const rawName = useObservableState(m.library.rawBook$.name$) || '';
    const checkedOutTitles = useObservableState(m.db.openBooks$) || {};

    const allBooks = {...builtInBooks, ...customBooks};

    const booksAvailableForCheckOut: ds_Dict<Website | CustomDocument> = Object.fromEntries(
        difference(Object.keys(allBooks), Object.keys(checkedOutTitles))
            .map(story => [story, allBooks[story]])
    );

    return <Paper>
        <Paper style={{display: 'flex', flexFlow: 'column nowrap'}}>
            <Paper style={{flexGrow: 1, maxHeight: '25%'}}>
                <Paper style={{width: '33%'}}>
                    Checked out
                    <NamedObjectList
                        listObjects={openBooks || {}}
                        onSelect={(b: OpenBook) => {
                            m.db.openBooks$.next(
                                {...m.db.openBooks$.getValue(), [b.name]: false}
                            )
                        }}
                    />
                </Paper>
                <Paper style={{width: '33%'}}>
                    To check out
                    <NamedObjectList
                        listObjects={booksAvailableForCheckOut}
                        onSelect={(b) => {
                            m.db.openBooks$.next(
                                {...m.db.openBooks$.getValue(), [b.name]: true}
                            )
                        }}
                    />
                </Paper>
            </Paper>
            <Paper>
                <Paper style={{display: 'flex', flexFlow: 'column nowrap'}}>
                    <div>
                        <TextField label="Raw story name" />
                        <Button onClick={() => {
                            m.library.appendCustomDocuments([new CustomDocument(rawName, rawText)])
                        } }>Save</Button>
                    </div>
                    <textarea
                        onChange={e => m.library.rawBook$.text$.next(e.target.value)}
                        value={rawText}
                    >
                    </textarea>
                </Paper>
                <Paper>
                    <div>
                        <TextField label="Simple story name" />
                        <Button onClick={() => {
                            m.library.appendCustomDocuments([new CustomDocument(simpleName, interpolateSimpleCustomDoc(simpleText))])
                        } }>Save</Button>
                    </div>
                    <textarea
                        onChange={e => m.library.simpleBook$.text$.next(e.target.value)}
                        value={simpleText}>
                    </textarea>
                </Paper>
            </Paper>
        </Paper>
    </Paper>
}
