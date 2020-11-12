import {Manager} from "../../lib/Manager";
import {useObservableState} from "observable-hooks";
import React from "react";
import {Paper, Button, TextField, IconButton} from "@material-ui/core";
import {isCustomDocument, Named} from "../../lib/Manager/OpenBooks";
import {difference} from 'lodash';
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import {ds_Dict} from "../../lib/Tree/DeltaScanner";
import DeleteIcon from '@material-ui/icons/Delete';
import {NamedObjectList} from "../../lib/Interfaces/named-object-list.interface";
import {CheckedOutBooks} from "./CheckedOutBooks";
import {AvailableBooks} from "./AvailableBooks";
import {CustomBook} from "./CustomBook";

export function Library({m}: { m: Manager }) {
    const builtInBooks = useObservableState(m.library.builtInBooks$.dict$) || {};
    const customBooks = useObservableState(m.library.customBooks$.dict$) || {};
    const checkedOutTitles = useObservableState(m.db.checkedOutBooks$) || {};

    const allBooks = {...builtInBooks, ...customBooks};

    const titlesAvailableForCheckout: ds_Dict<boolean> = Object.fromEntries(
        difference(Object.keys(allBooks), Object.keys(checkedOutTitles))
            .map(story => [story, true])
    );

    return <div className={'library-container'}>
        <div className={'checked-out-books-container'}>
            <CheckedOutBooks
                checkedOutBooks={checkedOutTitles}
                onReturn={(titleBeingReturned: string) => {
                    const checkedOutBooks = {...m.db.checkedOutBooks$.getValue()};
                    delete checkedOutBooks[titleBeingReturned];
                    m.db.checkedOutBooks$.next(checkedOutBooks)
                }}
            />
            <AvailableBooks
                availableBooks={titlesAvailableForCheckout}
                onCheckout={(titleBeingCheckedOut: string) => {
                    const checkedOutBooks = {...m.db.checkedOutBooks$.getValue()};
                    checkedOutBooks[titleBeingCheckedOut] = true;
                    m.db.checkedOutBooks$.next(checkedOutBooks)
                }}
            />
        </div>
        <div className={'custom-books-container'}>
            <CustomBook editingBook={m.library.simpleBook$}/>
            <CustomBook editingBook={m.library.rawBook$}/>
        </div>
    </div>

/*

    <Paper style={{height: '90vh'}}>
        <Paper style={{display: 'flex', flexFlow: 'row nowrap', height: '100%'}}>
            <Paper style={{flexGrow: 1}}>
                <Paper>
                    To check out
                    <BookList
                        listObjects={booksAvailableForCheckOut}
                        onSelect={(b) => {
                            m.db.checkedOutBooks$.next(
                                {...m.db.checkedOutBooks$.getValue(), [b.name]: true}
                            )
                        }}
                        onDelete={(b) => {
                            if (isCustomDocument(b)) {
                                m.library.deleteCustomDocument(b);
                            }
                        }}
                    />
                </Paper>
            </Paper>
        </Paper>
    </Paper>

*/
}
