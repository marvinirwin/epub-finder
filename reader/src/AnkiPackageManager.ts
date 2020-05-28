import {BehaviorSubject, Observable, ReplaySubject, Subject} from "rxjs";
import {Dictionary} from "lodash";
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

export class AnkiPackageManager {
    packages$: BehaviorSubject<Dictionary<UnserializedAnkiPackage>> = new BehaviorSubject({});
    currentPackage$: ReplaySubject<UnserializedAnkiPackage | undefined> = new ReplaySubject<UnserializedAnkiPackage | undefined>(undefined);
    private packageUpdate$: Subject<UnserializedAnkiPackage>;
    public messages$: Observable<DebugMessage>;

    constructor() {
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
        ].forEach(p => packageLoader.postMessage(JSON.stringify(p)))
    }

    recieveSerializedPackage(s: SerializedAnkiPackage) {
        this.packageUpdate$.next(UnserializeAnkiPackage(s))
    }
}