import {BehaviorSubject, Observable, Subject} from "rxjs";
import {Dictionary} from "lodash";
import {map, scan, withLatestFrom} from "rxjs/operators";
import {toast} from "react-toastify";

/* eslint import/no-webpack-loader-syntax:0 */
// @ts-ignore
import AnkiThread from 'worker-loader?name=dist/[name].js!./lib/worker-safe/anki-thread';
import {SerializedAnkiPackage, UnserializeAnkiPackage, UnserializedAnkiPackage} from "./lib/worker-safe/SerializedAnkiPackage";

export class AnkiPackageManager {
    packages$: BehaviorSubject<Dictionary<UnserializedAnkiPackage>> = new BehaviorSubject({});
    currentPackage$: BehaviorSubject<UnserializedAnkiPackage | undefined> = new BehaviorSubject<UnserializedAnkiPackage | undefined>(undefined);
    private packageUpdate$: Subject<UnserializedAnkiPackage>;
    public messages$: Observable<string>;

    recieveSerializedPackage(s: SerializedAnkiPackage) {
        this.packageUpdate$.next(UnserializeAnkiPackage(s))
    }

    constructor() {
        this.packageUpdate$ = new Subject<UnserializedAnkiPackage>();
        this.messages$ = this.packageUpdate$.pipe(map(m => `${m.name} ${m.message}`))
        const packageLoader: Worker = new AnkiThread();
        packageLoader.onmessage = v => eval(v.data);
        this.packageUpdate$.pipe(withLatestFrom(this.packages$))
            .subscribe(([newPackageUpdate, currentPackages]: [UnserializedAnkiPackage, Dictionary<UnserializedAnkiPackage>]) => {
/*
                if (newPackageUpdate.message) {
                    toast(newPackageUpdate.message);
                }
*/
                currentPackages[newPackageUpdate.name] = newPackageUpdate;
                if (Object.keys(currentPackages).length === 1) {
                    this.currentPackage$.next(newPackageUpdate);
                }
                this.packages$.next({...currentPackages});
            })
        const packages = [
            {name: 'Characters', path: '/chars.zip'},
            {name: 'Hanping', path: '/Hanping_Chinese_HSK_1-6.zip'},
            {name: 'GRE', path: '/GRE.zip'}
        ].forEach(p => packageLoader.postMessage(JSON.stringify(p)))
    }
}