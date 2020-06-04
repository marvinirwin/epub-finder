import Dexie from "dexie";
import {ReplaySubject, Subject} from "rxjs";
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
    messages$: Subject<string> = new Subject<string>();

    constructor() {
        super("MyAppDatabase");
        this.version(1).stores({
            cards: 'id++, characters, photos, sounds, english, ankiPackage, collection, deck, fields',
        });
        // The following lines are needed for it to work across typescipt using babel-preset-typescript:
        this.cards = this.table("cards");
    }

    async getMemodAnkiPackage(packageName: string): Promise<ICard[] | undefined> {
        this.messages$.next(`Checking for ${packageName}`)
        const exists = await this.cards.where('ankiPackage').equals(packageName).first();
        this.messages$.next(`First row for ${packageName} ${JSON.stringify(exists)}`)
        if (exists) {
            let promiseExtended = this.cards.where('ankiPackage').equals(packageName).toArray();
            return promiseExtended;
        }
        return undefined;
    }
}