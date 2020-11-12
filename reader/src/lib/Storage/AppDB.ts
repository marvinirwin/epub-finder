import Dexie from "dexie";
import {BehaviorSubject, Observable, ReplaySubject, Subject} from "rxjs";
import {ICard} from "../Interfaces/ICard";
import {WordRecognitionRow} from "../Scheduling/WordRecognitionRow";
import {Setting} from "../Interfaces/Setting";
import {CreatedSentence} from "../Interfaces/CreatedSentence";
import {CustomDocument} from "../Website/Website";
import {ds_Dict} from "../Tree/DeltaScanner";
import {Hotkeys} from "../HotKeyEvents";
import {map, shareReplay} from "rxjs/operators";


export class MyAppDatabase extends Dexie {
    static CURRENT_VERSION = 6;

    cards: Dexie.Table<ICard, number>;
    recognitionRecords: Dexie.Table<WordRecognitionRow, number>;
    createdSentences: Dexie.Table<CreatedSentence, number>;
    settings: Dexie.Table<Setting, string>;
    customDocuments: Dexie.Table<CustomDocument, string>;
    messages$: ReplaySubject<string> = new ReplaySubject<string>();
    private settingsListeners: {[setting: string]: BehaviorSubject<any>} = {};

    constructor() {
        super("MyAppDatabase");
        this.messages$.next("Starting database, creating stories")
        this.version(MyAppDatabase.CURRENT_VERSION).stores({
            cards: 'id++, learningLanguage, knownLanguage, deck',
            recognitionRecords: 'id++, word, timestamp',
            settings2: 'name, value',
            createdSentences: 'id++, learningLanguage',
            customDocuments: 'name, html'
        });
        this.messages$.next("Stores created, initializing AnkiPackageSQLiteTables")
        // The following lines are needed for it to work across typescipt using babel-preset-typescript:
        this.cards = this.table("cards");
        this.settings = this.table("settings2");
        this.recognitionRecords = this.table("recognitionRecords");
        this.createdSentences = this.table("createdSentences");
        this.customDocuments = this.table("customDocuments");
        this.messages$.next("Tables initialized")
    }

    async getCardsInDatabaseCount(): Promise<number> {
        return this.cards.offset(0).count();
    }

    async* getCardsFromDB(
        whereStmts: {[key: string]: any},
        chunkSize: number = 500
    ): AsyncGenerator<ICard[]> {
        let offset = 0;
        const f = Object.values(whereStmts).length ?
            () => this.cards.where(whereStmts).offset(offset) :
            () => this.cards.where('learningLanguage').notEqual('').offset(offset)
        while (await f().first()) {
            this.messages$.next(`Querying cards in chunks ${offset}`)
            const chunkedCards = await f().limit(chunkSize).toArray();
            yield chunkedCards;
            offset += chunkSize;
        }
    }

    async* getSentenceRowsFromDB(): AsyncGenerator<CreatedSentence[]>{
        let offset = 0;
        const chunkSize = 500;
        while (await this.createdSentences.offset(offset).first()) {
            this.messages$.next(`Querying cards in chunks ${offset}`)
            const chunkedCreatedSentences = await this.createdSentences.offset(offset).limit(chunkSize).toArray();
            yield chunkedCreatedSentences;
            offset += chunkSize;
        }
    }

    async* getRecognitionRowsFromDB(): AsyncGenerator<WordRecognitionRow[]> {
        let offset = 0;
        const chunkSize = 500;
        while (await this.recognitionRecords.offset(offset).first()) {
            this.messages$.next(`Querying cards in chunks ${offset}`)
            const chunkedRecognitionRows = await this.recognitionRecords.offset(offset).limit(chunkSize).toArray();
            chunkedRecognitionRows.forEach(r => r.word = r.word.normalize())
            yield chunkedRecognitionRows;
            offset += chunkSize;
        }
    }

    resolveSetting$<T>(settingName: string, defaultVal: T) {
        if (!this.settingsListeners[settingName]) {
            const behaviourSubject = new BehaviorSubject<T>(defaultVal);
            this.settings.where({name: settingName}).first().then(row => {
                if (row) {
                    behaviourSubject.next(JSON.parse(row.value))
                }
            });
            behaviourSubject.subscribe(value => {
                this.settings.put({name: settingName, value: JSON.stringify(value)}, settingName)
            });
            this.settingsListeners[settingName] = behaviourSubject;
        }
        return this.settingsListeners[settingName];
    }
    get checkedOutBooks$(): BehaviorSubject<ds_Dict<boolean>> {
        return this.resolveSetting$<ds_Dict<boolean>>('checkedOutBooks', {'generals.html': true})
    }

    get hotkeys$(): BehaviorSubject<Partial<Hotkeys<string[]>>> {
        return this.resolveSetting$<Partial<Hotkeys<string[]>>>('hotkeys', {});
    }

    public mapHotkeysWithDefault(
        defaultHotkeys: Hotkeys<string[]>,
        hotkeyActions: Hotkeys<Subject<void>>
    ): Observable<Map<string[], Subject<void>>> {
        return this.hotkeys$.pipe(
            map((hotkeyConfig) => {
                const keyMap = new Map<string[], Subject<void>>();
                let action: keyof Hotkeys<any>;
                // @ts-ignore
                const allActions: (keyof Hotkeys<any>)[] = Object.keys(hotkeyActions);
                const unsetActions = new Set<keyof Hotkeys<any>>(allActions);
                for (action in hotkeyConfig) {
                    if (!hotkeyActions[action]) {
                        console.warn(`Unknown hotkey action ${action}`)
                    }
                    unsetActions.delete(action);
                    keyMap.set(hotkeyConfig[action] || [], hotkeyActions[action])
                }
                unsetActions.forEach(unsetAction => {
                    keyMap.set(defaultHotkeys[unsetAction], hotkeyActions[unsetAction])
                })
                return keyMap;
            }),
            shareReplay(1)
        )
    }
}