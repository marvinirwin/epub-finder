import {ReplaySubject} from "rxjs";


export enum Modes {
     VIDEO="VIDEO",
     HIGHLIGHT="HIGHLIGHT",
     NORMAL="NORMAL"
}

export class ModesService {
     public mode$ = new ReplaySubject<Modes>(1);
     constructor() {
         this.mode$.next(Modes.NORMAL);
     }
}