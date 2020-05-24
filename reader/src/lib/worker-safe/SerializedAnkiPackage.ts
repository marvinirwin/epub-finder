import {Collection, SerializedCollection} from "./Collection";
import {Dictionary, fromPairs} from "lodash";
import {Card, SerializedCard} from "./Card";

export interface SerializedAnkiPackage {
    name: string
    path: string
    message: string
    collections: SerializedCollection[] | null;
    cardIndex: Dictionary<SerializedCard[]> | null
}

export interface UnserializedAnkiPackage {
    name: string
    path: string
    message: string
    collections: Collection[] | null;
    cardIndex: Dictionary<Card[]> | null
}

export function UnserializeAnkiPackage(o: SerializedAnkiPackage): UnserializedAnkiPackage {
    let entries = o.cardIndex ? Object.entries(o.cardIndex) : null;
    let pairs = entries && entries.map(([k, v]) => [k, v.map(sc => Card.fromSerialized(sc))]);
    const cIndex = o.cardIndex ? fromPairs(pairs) : null;
    return {
        name: o.name,
        path: o.path,
        message: o.message,
        collections: o.collections ? o.collections.map(c => Collection.fromSerialiazed(c)) : null,
        cardIndex: cIndex
    }
}