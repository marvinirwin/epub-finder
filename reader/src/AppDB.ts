import Dexie from "dexie";
import {ReplaySubject} from "rxjs";
import {ICard} from "./lib/worker-safe/icard";

export class MyAppDatabase extends Dexie {
    cards: Dexie.Table<ICard, number>;
    messages$: ReplaySubject<string> = new ReplaySubject<string>();

    constructor(cb: (s: string) => void) {
        super("MyAppDatabase");
        this.messages$.subscribe(v => cb)
        this.messages$.next("Starting database, creating stories")
        this.version(1).stores({
            cards: 'id++, characters, english, ankiPackage, collection, deck',
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
            const cards = [];
            let offset = 0;
            let chunkSize = 100;
            while (await this.cards.where('ankiPackage').equals(packageName).offset(offset).first()) {
                this.messages$.next(`Querying cards in chunks ${offset}`)
                const chunkedCards = await this.cards.where('ankiPackage').equals(packageName).offset(offset).limit(chunkSize).toArray();
                offset += chunkSize;
                cards.push(...chunkedCards)
            }
            return cards;
        }
        return undefined;
    }
}