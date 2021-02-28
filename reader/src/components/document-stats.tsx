import {Manager} from "../lib/Manager";
import React from "react";
import {useObservableState} from "observable-hooks";
import HSK1 from "../lib/hsk/hsk-level-1.json";
import {HSKWord} from "../lib/manager/ProgressManager";
import {ds_Dict} from "../lib/delta-scan/delta-scan.module";
import { flatten, orderBy } from "lodash";
import {isChineseCharacter} from "../../../server/src/shared/OldAnkiClasses/Card";
import {OpenDocument} from "../lib/document-frame/open-document.entity";


const hsk1Array = HSK1 as HSKWord[];
const hsk1Words = hsk1Array.map(({hanzi}) => hanzi);
const hsk1WordSet = new Set(hsk1Words);
const hsk1Characters = new Set(flatten(hsk1Words))



export const DocumentStats: React.FunctionComponent<{m: Manager, b: OpenDocument}> = ({children, m, b}) => {
    const atomizedDocument = useObservableState(b.atomizedDocument$)
    const characterCounts: ds_Dict<number> = {};
    if (atomizedDocument) {
        // This is probably normalized, right?
        // TODO we can get the text from joining all the segments
/*
        for (let i = 0; i < atomizedDocument.text.length; i++) {
            const character = atomizedDocument.text[i];
            if (!isChineseCharacter(character)) {
                continue;
            }
            if (!characterCounts[character]) {
                characterCounts[character] = 0;
            }
            characterCounts[character]++;
        }
        askldfjaklsdjfklajsdlfj


        a
        sdfasdfasdf
*/
    }
    return <div className={'documentstats'}>
        <div>Distinct Characters: {Object.keys(characterCounts).length}</div>
        <div>HSK-1 Characters: {Object.keys(characterCounts).filter(character => hsk1Characters.has(character)).length}</div>
        {orderBy(Object.entries(characterCounts), ([character, count]) => count).map(([char, count]) => <div key={char}>
            {char}: {count} HSK1: {hsk1Characters.has(char) ? 'True' : 'False'}
        </div>)}
    </div>
}