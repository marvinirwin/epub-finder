import {Manager} from "../../lib/Manager";
import {useObservableState} from "observable-hooks";
import React from "react";
import {difference} from 'lodash';
import {ds_Dict} from "../../lib/Tree/DeltaScanner";
import {CheckedOutBooks} from "./CheckedOutBooks";
import {AvailableBooks} from "./AvailableBooks";
import {CustomBook} from "./CustomBook";

export function Library({m}: { m: Manager }) {
/*
    const builtInBooks = useObservableState(m.library.builtInBooks$.dict$) || {};

    const customBooks = useObservableState(m.library.customBooks$.dict$) || {};
    const checkedOutTitles = useObservableState(m.settingsService.checkedOutBooks$) || {};

    const allBooks = {...builtInBooks, ...customBooks};

    const titlesAvailableForCheckout: ds_Dict<boolean> = Object.fromEntries(
        difference(Object.keys(allBooks), Object.keys(checkedOutTitles))
            .map(story => [story, true])
    );

*/
    return <div className={'library-container'}>
{/*
        <div className={'checked-out-books-container'}>
            <CheckedOutBooks
                checkedOutBooks={checkedOutTitles}
                onReturn={(titleBeingReturned: string) => {
                    returnBook(m, titleBeingReturned);
                }}
            />
            <AvailableBooks
                availableBooks={titlesAvailableForCheckout}
                onCheckout={(titleBeingCheckedOut: string) => {
                    checkoutBook(m, titleBeingCheckedOut);
                }}
            />
        </div>
        <div className={'custom-books-container'}>
            <CustomBook editingBook={m.library.simpleBook$}/>
            <CustomBook editingBook={m.library.rawBook$}/>
        </div>
*/}
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
