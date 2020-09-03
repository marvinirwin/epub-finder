import {OpenBooks} from "../OpenBooks";
import CardManager from "../CardManager";
import {delay, filter, switchMap, switchMapTo, withLatestFrom} from "rxjs/operators";
import {merge} from "rxjs";
import {isChineseCharacter} from "../../Interfaces/OldAnkiClasses/Card";
import {getNewICardForWord} from "../../Util/Util";
import {flattenTree} from "../../Util/DeltaScanner";

export function CardPage(c: CardManager, p: OpenBooks) {
    c.cardProcessingSignal$.pipe(
        filter(b => {
            debugger;
            return !b;
        }),
        delay(100),
        switchMapTo(p.openedBooks.updates$),
        switchMap(({sourced}) => merge(...(sourced ? flattenTree(sourced) : []).map(pageRenderer => pageRenderer.text$))),
        withLatestFrom(c.cardIndex$)
    ).subscribe(([text, cardIndex]) => {
        debugger;
        const newCharacterSet = new Set<string>();
        for (let i = 0; i < text.length; i++) {
            const textElement = text[i];
            if (isChineseCharacter(textElement)) {
                if (!cardIndex[textElement]) {
                    newCharacterSet.add(textElement);
                }
            }
        }
        const newCards = Array.from(newCharacterSet.keys()).map(c => getNewICardForWord(c, ''));
        if (newCards.length) {
            c.addUnpersistedCards$.next(newCards);
        }
    });
}