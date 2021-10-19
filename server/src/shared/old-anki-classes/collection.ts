import { Card } from './card'
import { flattenDeep } from 'lodash'
import { Deck, SerializedDeck } from './deck'
import { ICard } from '../ICard'

export class Collection {
    allCards: ICard[]
    name: any

    constructor(public decks: Deck[], name: string) {
        this.allCards = flattenDeep(decks.map((d) => d.cards))
    }
    static fromSerialiazed(c: SerializedCollection) {
        return new Collection(
            c.decks.map((d) => Deck.fromSerialized(d)),
            c.name,
        )
    }
}

export class SerializedCollection {
    name: any
    allCards: ICard[]

    constructor(public decks: SerializedDeck[], name: string) {
        this.allCards = []
    }
}
