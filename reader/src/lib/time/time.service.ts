import {ReplaySubject} from "rxjs";

export class TimeService {
    quizNow$ = new ReplaySubject<Date>()
    constructor() {
        this.quizNow$.next(new Date())
    }
}