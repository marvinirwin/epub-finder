import {Manager} from "../../lib/Manager";
import React, {useContext} from "react";
import { useObservableState} from "observable-hooks";
import {orderBy} from "lodash";
import {HotkeyContext} from "../Main";
import {TextField} from "@material-ui/core";

export function SettingsPage({m}: { m: Manager }) {
    const bookWordDatas = useObservableState(m.openedBooks.checkedOutBooksData$, []);
    const sentenceSet = new Set<string>();
    bookWordDatas.forEach(d => Object.values(d.wordSentenceMap).map(s => s.forEach(sentence => sentenceSet.add(sentence.translatableText))));
    const sentences = Array.from(sentenceSet);

    const hotkeyConfig = useContext(HotkeyContext);

    return <div className="settings-page">
        <div className="hotkey-config">
            {orderBy(Object.entries(hotkeyConfig), ([action]) => action).map(([action, arr]) => {
                return <TextField
                    label={action}
                    placeholder={action}
                    value={(arr || []).join('+')}
                    onChange={e => {
                        debugger;
                        m.db.hotkeys$.next(
                            {
                                ...m.db.hotkeys$.getValue(),
                                [action]: e.target.value.split('+')
                            }
                        );
                    }
                    }
                />;
            })}
        </div>
        <div>
            {sentences.map(sentence => <div>{sentence}</div>)}
        </div>
    </div>
}