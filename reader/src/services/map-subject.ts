import { Observable, Subject } from 'rxjs'
import { map, shareReplay } from 'rxjs/operators'
import {SettingObject} from "./settings.service";

export class MapSubject<MapSubjectType, SourceSubjectType> {
    public obs$: Observable<MapSubjectType>
    public static StringifyMapSubject<T>(s$: SettingObject<string>) {
        return new MapSubject<T, string>(
            s$,
            (v) => JSON.stringify(v),
            (v) => JSON.parse(v),
        )
    }
    constructor(
        private settingObject: SettingObject<SourceSubjectType>,
        private inFunc: (v: MapSubjectType) => SourceSubjectType,
        private outFunc: (v: SourceSubjectType) => MapSubjectType,
    ) {

        this.obs$ = this.settingObject.obs$.pipe(map(this.outFunc), shareReplay(1))
    }
    next(v: MapSubjectType) {
        this.settingObject.user$.next(this.inFunc(v))
    }
}
