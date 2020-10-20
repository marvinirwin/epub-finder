import {Manager} from "../../lib/Manager";
import React from "react";
import {debounceTime, map, scan} from "rxjs/operators";
import {useObservable, useObservableState} from "observable-hooks";
import {flatten, uniq} from "lodash";

export function SettingsPage({m}: { m: Manager }) {
    const bookWordDatas = useObservableState(m.openedBooks.checkedOutBooksData$, []);
    const sentenceSet = new Set<string>();

    bookWordDatas.forEach(d => Object.values(d.wordSentenceMap).map(s => s.forEach(sentence => sentenceSet.add(sentence.translatableText))));
    const a = Array.from(sentenceSet);

    return <div>
        {a.map(sentence => <div>{sentence}</div>)}
    </div>
}