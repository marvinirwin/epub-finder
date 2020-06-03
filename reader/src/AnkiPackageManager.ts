import {BehaviorSubject, Observable, ReplaySubject, Subject} from "rxjs";
import {Dictionary, flatten} from "lodash";
import {filter, map, scan, withLatestFrom} from "rxjs/operators";
import {toast} from "react-toastify";

/* eslint import/no-webpack-loader-syntax:0 */
// @ts-ignore
import AnkiThread from 'worker-loader?name=dist/[name].js!./lib/worker-safe/anki-thread';
import {
    SerializedAnkiPackage,
    UnserializeAnkiPackage,
    UnserializedAnkiPackage
} from "./lib/worker-safe/SerializedAnkiPackage";
import DebugMessage from "./Debug-Message";
import {Deck} from "./lib/worker-safe/Deck";
import {Collection, SerializedCollection} from "./lib/worker-safe/Collection";
import {Card, SerializedCard} from "./lib/worker-safe/Card";
import {ICard, MyAppDatabase} from "./AppDB";
import {CardManager} from "./Cardmanager";

export class AnkiPackageManager {
    packages$: BehaviorSubject<Dictionary<UnserializedAnkiPackage>> = new BehaviorSubject({});
    currentPackage$: ReplaySubject<UnserializedAnkiPackage | undefined> = new ReplaySubject<UnserializedAnkiPackage | undefined>(undefined);
    public packageUpdate$: Subject<UnserializedAnkiPackage>;
    public messages$: Observable<DebugMessage>;
    currentDeck$: Observable<Deck | undefined>;
    currentCollection$: Subject<Collection | undefined> = new Subject<Collection|undefined>();

    constructor(public appDb: MyAppDatabase, public cardManager: CardManager) {
        this.currentPackage$.next(undefined);
        this.packageUpdate$ = new Subject<UnserializedAnkiPackage>();
        this.messages$ = this.packageUpdate$.pipe(filter(m => !!m.message), map(m => new DebugMessage(m.name, m.message)))
        const packageLoader: Worker = new AnkiThread();
        packageLoader.onmessage = v => eval(v.data);
        this.packageUpdate$.pipe(withLatestFrom(this.packages$))
            .subscribe(([newPackageUpdate, currentPackages]: [UnserializedAnkiPackage, Dictionary<UnserializedAnkiPackage>]) => {
                currentPackages[newPackageUpdate.name] = newPackageUpdate;
                if (Object.keys(currentPackages).length === 1) {
                    this.currentPackage$.next(newPackageUpdate);
                }
                this.packages$.next({...currentPackages});
            })
        const packages = [
            {name: 'Characters', path: '/chars.zip'},
        ].forEach(p => packageLoader.postMessage(JSON.stringify(p)));

        this.currentDeck$ = this.currentPackage$.pipe(map(pkg => {
            // This probably wont work
            const col = pkg?.collections?.find(c => c.allCards.length)
            this.currentCollection$.next(col?.name);
            return col?.decks.find(d => d.cards.length);
        }))
    }

    recieveSerializedPackage(s: SerializedAnkiPackage) {
        if (s.cards) {
            this.cardManager.addCard$.next(s.cards);
        }
        this.packageUpdate$.next(UnserializeAnkiPackage(s))
    }
}