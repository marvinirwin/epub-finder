import CardsRepository from "../cards.repository";
import {OpenDocumentsService} from "../open-documents.service";
import EditingCardManager from "../EditingCardManager";
import {resolveICardForWord} from "../../pipes/ResolveICardForWord";
import {ICard} from "../../../../../server/src/shared/ICard";
import {EditingCard} from "../../reactive-classes/EditingCard";
import {CardDB} from "../../Manager";
import {AudioManager} from "../AudioManager";


export function CardPageEditingCardCardDBAudio(
    c: CardsRepository,
    p: OpenDocumentsService,
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
