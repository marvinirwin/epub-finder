import {BehaviorSubject, Subject} from "rxjs";
import {Dictionary} from "lodash";
import {withLatestFrom} from "rxjs/operators";
import {toast} from "react-toastify";

/* eslint import/no-webpack-loader-syntax:0 */
// @ts-ignore
import MyWorker from 'worker-loader?name=dist/[name].js!./lib/worker-safe/worker';
import {Serializing, UnserializeAnkiPackage, UnserializedAnkiPackage} from "./lib/worker-safe/Serializing";

export class AnkiPackageManager {
    packages$: BehaviorSubject<Dictionary<UnserializedAnkiPackage>> = new BehaviorSubject({});
    currentPackage$: BehaviorSubject<UnserializedAnkiPackage | undefined> = new BehaviorSubject<UnserializedAnkiPackage | undefined>(undefined);
    private packageUpdate$: Subject<UnserializedAnkiPackage>;


    recieveSerializedPackage(s: Serializing) {
        this.packageUpdate$.next(UnserializeAnkiPackage(s))
    }

    constructor() {
        this.packageUpdate$ = new Subject<UnserializedAnkiPackage>();
        const packageLoader: Worker = new MyWorker();
        packageLoader.onmessage = v => eval(v.data);
        this.packageUpdate$.pipe(withLatestFrom(this.packages$))
            .subscribe(([newPackageUpdate, currentPackages]: [UnserializedAnkiPackage, Dictionary<UnserializedAnkiPackage>]) => {
                if (newPackageUpdate.message) {
                    toast(newPackageUpdate.message);
                }
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