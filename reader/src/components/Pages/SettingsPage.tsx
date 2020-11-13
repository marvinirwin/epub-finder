import {Manager} from "../../lib/Manager";
import React, {useContext} from "react";
import {useObservableState} from "observable-hooks";
import {HotkeyContext} from "../Main";
import {HotkeyConfig} from "../Hotkeys/HotkeyConfig";

export function SettingsPage({m}: { m: Manager }) {
    const bookWordDatas = useObservableState(m.openedBooks.checkedOutBooksData$, []);
    const sentenceSet = new Set<string>();
    bookWordDatas.forEach(d => Object.values(d.wordSentenceMap).map(s => s.forEach(sentence => sentenceSet.add(sentence.translatableText))));
    const sentences = Array.from(sentenceSet);

    const hotkeyConfig = useContext(HotkeyContext);

    return <div className="settings-page">
        <div className="hotkey-config">
            <HotkeyConfig hotkeyConfig={hotkeyConfig} m={m}/>
        </div>
        <div>
            {sentences.map(sentence => <div>{sentence}</div>)}
        </div>
    </div>
}