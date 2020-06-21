import {Card, SerializedCard} from "./Card";
import {ICard} from "../ICard";

export class Deck {
    constructor(public cards: ICard[], public name: string) {
    }
    static fromSerialized(d: SerializedDeck): Deck {
        return new Deck(d.cards, d.name)
    }
}

export interface SerializedDeck {
    cards: ICard[];
    name: string;
}

