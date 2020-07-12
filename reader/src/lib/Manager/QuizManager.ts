import {combineLatest, Observable, ReplaySubject, Subject} from "rxjs";
import {ICard} from "../Interfaces/ICard";
import {debounceTime, map, switchMap, withLatestFrom} from "rxjs/operators";
import {IWordRecognitionRow} from "../Scheduling/IWordRecognitionRow";
import React from "react";
import {QuizCardProps} from "../../components/QuizPopup";


export interface ScorePair {
    word: string;
    score: number;
}

export class QuizManager {
    quizzingCard$: ReplaySubject<ICard | undefined> = new ReplaySubject<ICard | undefined>(1);
    queuCharacterToBeQuizzed: Subject<string> = new Subject<string>();
    nextScheduledQuizItem = new ReplaySubject<ICard>(1);
    completedQuizItem$ = new Subject<ScorePair>();

    currentQuizItem$ = new ReplaySubject<ICard>();
    currentQuizDialogComponent$ = new ReplaySubject<React.FunctionComponent<QuizCardProps>>(1);

    constructor() {
    }
}