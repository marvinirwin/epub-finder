import {combineLatest, Observable, ReplaySubject, Subject} from "rxjs";
import {ICard} from "../Interfaces/ICard";
import React from "react";
import {QuizCardProps} from "../../components/Quiz/Popup";
import {Characters} from "../../components/Quiz/Characters";
import {withLatestFrom} from "rxjs/operators";
import {LocalStorageManager} from "../Storage/StorageManagers";
import { LocalStored } from "../Storage/LocalStored";
import {NavigationPages} from "../Util/Util";

export interface ScorePair {
    word: string;
    score: number;
}

export class QuizManager {
    scheduleQuizItemList$ = new ReplaySubject<ICard[]>(1);
    completedQuizItem$ = new Subject<ScorePair>();

    currentQuizItem$ = new ReplaySubject<ICard | undefined>();
    currentQuizDialogComponent$ = new ReplaySubject<React.FunctionComponent<QuizCardProps>>(1);

    newCount$: ReplaySubject<number>  = new ReplaySubject<number>(1)
    overdueCount$: ReplaySubject<number>  = new ReplaySubject<number>(1)
    dueTodayCount$: ReplaySubject<number>  = new ReplaySubject<number>(1)

    constructor() {}

    setQuizItem(icard: ICard) {
        this.currentQuizItem$.next(icard);
        this.currentQuizDialogComponent$.next(Characters)
            this.currentQuizItem$.pipe(withLatestFrom(this.scheduleQuizItemList$)).subscribe(([item, nextScheduledItems]) => {
                if (!item) {
                    this.currentQuizItem$.next(nextScheduledItems[0])
                }
            })
    }

}