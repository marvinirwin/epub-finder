import Dexie from "dexie";
import {ReplaySubject} from "rxjs";
import {Dictionary} from "lodash";
import {AnkiPackage} from "./Anki";

export interface ICard {
    id?: number; // Primary key. Optional (autoincremented)
    characters: string;
    photos: string[];
    sounds: string[];
    english: string[];
    ankiPackage: string | undefined;
    collection: string | undefined;
    deck: string | undefined;
    fields: string[];
}

export class MyAppDatabase extends Dexie {
    cards: Dexie.Table<ICard, number>;

    constructor() {
        super("MyAppDatabase");
        this.version(1).stores({
            cards: 'id++, characters, photos, sounds, english, ankiPackage, collection, deck, fields',
        });
        // The following lines are needed for it to work across typescipt using babel-preset-typescript:
        this.cards = this.table("cards");
    }

    async getMemodAnkiPackage(packageName: string): Promise<ICard[] | undefined> {
        const exists = await this.cards.where({package: packageName}).limit(1).first();
        if (exists) {
            return this.cards.where({package: packageName}).toArray();
        }
        return undefined;
    }
}