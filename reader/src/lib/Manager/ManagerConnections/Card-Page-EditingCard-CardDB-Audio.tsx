import CardManager from "../CardManager";
import {OpenBookManager} from "../OpenBookManager";
import {delay, filter, switchMap, switchMapTo, withLatestFrom} from "rxjs/operators";
import {merge} from "rxjs";
import {isChineseCharacter} from "../../Interfaces/OldAnkiClasses/Card";
import {getNewICardForWord} from "../../Util/Util";
import EditingCardManager from "../EditingCardManager";
import {resolveICardForWord} from "../../Pipes/ResolveICardForWord";
import {ICard} from "../../Interfaces/ICard";
import {EditingCard} from "../../ReactiveClasses/EditingCard";
import {CardDB} from "../../Manager";
import {AudioManager} from "../AudioManager";


export function CardPageEditingCardCardDBAudio(
    c: CardManager,
    p: OpenBookManager,
    e: EditingCardManager,
    cdb: CardDB,
    a: AudioManager,

) {
    e.requestEditWord$.pipe(
        resolveICardForWord<string, ICard>(c.cardIndex$)
    ).subscribe((icard) => {
        e.queEditingCard$.next(EditingCard.fromICard(icard, cdb, a, c))
    });
}
