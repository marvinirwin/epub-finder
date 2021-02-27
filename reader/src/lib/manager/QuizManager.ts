import {Observable, Subject} from "rxjs";
import {ICard} from "../../../../server/src/shared/ICard";
import {AlertsService} from "../../services/alerts.service";
import {SuperMemoGrade} from "supermemo";

export interface QuizResult {
    word: string;
    grade: SuperMemoGrade;
}

export enum QuizComponent {
    Conclusion = "Conclusion",
    Characters = "Characters"
}

export class QuizManager {
    quizResult$ = new Subject<QuizResult>();
    requestNextCard$ = new Subject<void>();


    completeQuiz(word : string, recognitionScore : SuperMemoGrade ) {
        this.quizResult$.next({
            grade: recognitionScore,
            word
        });

        this.requestNextCard$.next()
    }

}