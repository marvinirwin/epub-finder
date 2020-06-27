import {ICard} from "./ICard";

export enum ThreadMessageKey {
    Cards = "CARDS",
    DEBUG = "DEBUG"
}
export interface ThreadMessage {
    key: ThreadMessageKey,
}
export interface CardMessage extends ThreadMessage {
    cards: ICard[];
}

export enum Settings {
    MOST_POPULAR_WORDS = "MOST_POPULAR_WORDS"
}

