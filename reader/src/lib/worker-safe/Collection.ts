import {Card} from "./Card";
import { flattenDeep } from "lodash";
import {Deck} from "./Deck";

export class Collection {
    allCards: Card[];
    constructor(public decks: Deck[]) {
        this.allCards = flattenDeep(decks.map(d => d.cards))
    }
}