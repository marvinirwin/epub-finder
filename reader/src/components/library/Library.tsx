import {Manager} from "../../lib/Manager";
import {useObservableState} from "observable-hooks";
import React from "react";
import {difference} from 'lodash';
import {ds_Dict} from "../../lib/Tree/DeltaScanner";
import {CheckedOutDocuments} from "./CheckedOutDocuments";
import {AvailableDocuments} from "./AvailableDocuments";
import {CustomDocument} from "./CustomDocument";

export function Library({m}: { m: Manager }) {
/*
    const builtInDocuments = useObservableState(m.library.builtInDocuments$.dict$) || {};

    const customDocuments = useObservableState(m.library.customDocuments$.dict$) || {};
    const checkedOutTitles = useObservableState(m.settingsService.checkedOutDocuments$) || {};

    const allDocuments = {...builtInDocuments, ...customDocuments};

    const titlesAvailableForCheckout: ds_Dict<boolean> = Object.fromEntries(
        difference(Object.keys(allDocuments), Object.keys(checkedOutTitles))
            .map(story => [story, true])
    );

*/
    return <div className={'library-container'}>
{/*
        <div className={'checked-out-documents-container'}>
            <CheckedOutDocuments
                checkedOutDocuments={checkedOutTitles}
                onReturn={(titleBeingReturned: string) => {
                    returnDocument(m, titleBeingReturned);
                }}
            />
            <AvailableDocuments
                availableDocuments={titlesAvailableForCheckout}
                onCheckout={(titleBeingCheckedOut: string) => {
                    checkoutDocument(m, titleBeingCheckedOut);
                }}
            />
        </div>
        <div className={'custom-documents-container'}>
            <CustomDocument editingDocument={m.library.simpleDocument$}/>
            <CustomDocument editingDocument={m.library.rawDocument$}/>
        </div>
*/}
    </div>

/*

    <Paper style={{height: '90vh'}}>
        <Paper style={{display: 'flex', flexFlow: 'row nowrap', height: '100%'}}>
            <Paper style={{flexGrow: 1}}>
                <Paper>
                    To check out
                    <DocumentList
                        listObjects={documentsAvailableForCheckOut}
                        onSelect={(b) => {
                            m.db.checkedOutDocuments$.next(
                                {...m.db.checkedOutDocuments$.getValue(), [b.name]: true}
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
