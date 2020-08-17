import {ColdSubject} from "../Util/ColdSubject";
import {Subject} from "rxjs";

export class Characters {
    textData$ = new ColdSubject();
    learningLanguage$ = new Subject<string | undefined>();
    constructor() {
        this.learningLanguage$
    }
}