import {BehaviorSubject, ReplaySubject} from "rxjs";


export enum Modes {
     VIDEO="VIDEO",
     HIGHLIGHT="HIGHLIGHT",
     NORMAL="NORMAL"
}

export class ModesService {
     public mode$ = new BehaviorSubject<Modes>(Modes.NORMAL);
     constructor() {
         this.mode$.next(Modes.NORMAL);
     }
}