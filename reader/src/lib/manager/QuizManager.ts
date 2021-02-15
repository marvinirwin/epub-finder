import {Observable, Subject} from "rxjs";
import {ICard} from "../interfaces/ICard";
import {AlertsService} from "../../services/alerts.service";

export interface QuizResult {
    word: string;
    score: number;
}

export enum QuizComponent {
    Conclusion = "Conclusion",
    Characters = "Characters"
}

export class QuizManager {
    quizResult$ = new Subject<QuizResult>();
    requestNextCard$ = new Subject<void>();

    constructor() {
    }

    completeQuiz(word : string, recognitionScore : number ) {
        this.quizResult$.next({
            score: recognitionScore,
            word
        });

        this.requestNextCard$.next()
    }

}