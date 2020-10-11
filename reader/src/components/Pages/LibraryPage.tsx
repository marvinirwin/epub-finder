import {Manager} from "../../lib/Manager";
import {useObservableState} from "observable-hooks";
import React, {Fragment} from "react";
import {SlidingTopWindows} from "./ReadingPage";
import {Conclusion} from "../Quiz/Conclusion";
import {Characters} from "../Quiz/Characters";
import {Paper} from "@material-ui/core";
import {flattenNamedObject, Named} from "../../lib/Manager/OpenBooks";
import {difference} from 'lodash';
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import {ds_Dict} from "../../lib/Util/DeltaScanner";
import {OpenBook} from "../../lib/BookFrame/OpenBook";
import {CustomDocument} from "../../lib/Website/Website";

export interface NamedObjectParams<T extends Named> {
    listObjects: T[] | ds_Dict<T>;
    onSelect: (v: T) => void
}

export const NamedObjectList = <T extends Named>({listObjects, onSelect}: NamedObjectParams<T>) =>
    <List dense={true}>
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
    </List>


export function LibraryPage({m}: { m: Manager }) {
    const openBooks = useObservableState(m.openedBooks.sourceBooks$);
    const builtInBooks = useObservableState(m.library.builtInBooks$.updates$.pipe(flattenNamedObject('root')));
    const customBooks = useObservableState(m.library.customBooks$.updates$.pipe(flattenNamedObject('root'))) || {};
    const availableStories = Object.fromEntries(
        difference(Object.keys(builtInBooks || {}), Object.keys(openBooks || {}))
            .map(story => [story, customBooks[story]])
    );

    const simpleText = useObservableState(m.library.simpleBook$.text$);
    const rawText = useObservableState(m.library.rawBook$.text$);

    return <Paper>
        <Paper style={{display: 'flex', flexFlow: 'column nowrap'}}>
            <Paper style={{flexGrow: 1, maxHeight: '25%'}}>
                <Paper style={{width: '50%'}}>
                    <NamedObjectList
                        listObjects={openBooks || {}}
                        onSelect={(b: OpenBook) => {
                        }}
                    />
                </Paper>
                <Paper style={{width: '50%'}}>
                    <NamedObjectList
                        listObjects={availableStories}
                        onSelect={(b: CustomDocument) => {
                        }}
                    />
                </Paper>
            </Paper>
            <Paper>
                <Paper>
                    <textarea onChange={e => m.library.rawBook$.text$.next(e.target.value)} value={rawText}>
                    </textarea>
                </Paper>
                <Paper>
                    <textarea onChange={e => m.library.simpleBook$.text$.next(e.target.value)} value={simpleText}>
                    </textarea>
                </Paper>
            </Paper>
        </Paper>
    </Paper>
}
