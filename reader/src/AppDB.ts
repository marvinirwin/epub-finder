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
    messages$: ReplaySubject<string> = new ReplaySubject<string>();

    constructor(cb: (s: string) => void) {
        super("MyAppDatabase");
        this.messages$.subscribe(v => cb)
        this.messages$.next("Starting database, creating stories")
        this.version(1).stores({
            cards: 'id++, characters, photos, sounds, english, ankiPackage, collection, deck, fields',
        });
        this.messages$.next("Stores created, initializing cards")
        // The following lines are needed for it to work across typescipt using babel-preset-typescript:
        this.cards = this.table("cards");
        this.messages$.next("Cards initialized")
    }

    async getMemodAnkiPackage(packageName: string): Promise<ICard[] | undefined> {
        this.messages$.next(`Checking for ${packageName}`)
        const exists = await this.cards.where('ankiPackage').equals(packageName).first();
        if (exists) {
            this.messages$.next(`Found cached cards for ${packageName}, not loading from AnkiPackage`)
            let promiseExtended = this.cards.where('ankiPackage').equals(packageName).toArray();
            debugger;
            return promiseExtended;
        }
        return undefined;
    }
}