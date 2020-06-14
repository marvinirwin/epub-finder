import Dexie from "dexie";
import {ReplaySubject} from "rxjs";
import {ICard} from "./worker-safe/icard";

export class MyAppDatabase extends Dexie {
    cards: Dexie.Table<ICard, number>;
    messages$: ReplaySubject<string> = new ReplaySubject<string>();

    constructor(cb: (s: string) => void) {
        super("MyAppDatabase");
        this.messages$.subscribe(v => cb(v))
        this.messages$.next("Starting database, creating stories")
        this.version(1).stores({
            cards: 'id++, characters, english, ankiPackage, collection, deck',
        });
        this.messages$.next("Stores created, initializing cards")
        // The following lines are needed for it to work across typescipt using babel-preset-typescript:
        this.cards = this.table("cards");
        this.messages$.next("Cards initialized")
    }

    async getCachedCardsExists(packageName: string): Promise<boolean> {
        return !!this.cards.where('ankiPackage').equals(packageName).first();
    }

    async* getCardsFromDB(packageName: string): AsyncGenerator<ICard> {
        let offset = 0;
        let chunkSize = 500;
        while (await this.cards.where('ankiPackage').equals(packageName).offset(offset).first()) {
            this.messages$.next(`Querying cards in chunks ${offset}`)
            const chunkedCards = await this.cards.where('ankiPackage').equals(packageName).offset(offset).limit(chunkSize).toArray();
            for (let i = 0; i < chunkedCards.length; i++) {
                const chunkedCard = chunkedCards[i];
                yield chunkedCard;
            }
            offset += chunkSize;
        }
    }
}