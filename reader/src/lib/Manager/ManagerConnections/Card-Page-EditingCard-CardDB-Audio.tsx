import CardManager from "../CardManager";
import {OpenBooksService} from "../OpenBooksService";
import EditingCardManager from "../EditingCardManager";
import {resolveICardForWord} from "../../Pipes/ResolveICardForWord";
import {ICard} from "../../Interfaces/ICard";
import {EditingCard} from "../../ReactiveClasses/EditingCard";
import {CardDB} from "../../Manager";
import {AudioManager} from "../AudioManager";


export function CardPageEditingCardCardDBAudio(
    c: CardManager,
    p: OpenBooksService,
    e: EditingCardManager,
    cdb: CardDB,
    a: AudioManager,
) {
    e.requestEditWord$.pipe(
        resolveICardForWord<string, ICard>(c.cardIndex$)
    ).subscribe((icard) => {
        e.queEditingCard$.next(EditingCard.fromICard(icard, cdb, c))
        a.queSynthesizedSpeechRequest$.next(icard.learningLanguage);
    });
}
