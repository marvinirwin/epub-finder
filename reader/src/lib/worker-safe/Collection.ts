import {Card} from "./Card";
import { flattenDeep } from "lodash";
import {Deck} from "./Deck";

export class Collection {
    allCards: Card[];
    name: any;
    constructor(public decks: Deck[], name: string) {
        this.allCards = flattenDeep(decks.map(d => d.cards))
    }
}