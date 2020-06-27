import {ICard} from "./ICard";

export enum MessageKey {
    CARDS = "CARDS"
}

export interface Message {
    key: MessageKey.CARDS
}

export interface CardMessage extends Message {
    cards: ICard[]
}