import {Card, SerializedCard} from "./Card";

export class Deck {
    constructor(public cards: Card[], public name: string) {
    }
    static fromSerialized(d: SerializedDeck): Deck {
        return new Deck(d.cards.map(c => Card.fromSerialized(c)), d.name)
    }
}

export interface SerializedDeck {
    cards: SerializedCard[];
    name: string;
}

