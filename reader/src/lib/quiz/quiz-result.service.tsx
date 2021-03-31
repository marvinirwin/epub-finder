import { WordRecognitionProgressRepository } from "../schedule/word-recognition-progress.repository";
import { QuizResultToRecognitionRows } from "../pipes/QuizResultToRecognitionRows";
import { QuizCardScheduleRowsService } from "../schedule/quiz-card-schedule-rows.service";
import { GeneralToastMessageService } from "../user-interface/general-toast-message.service";
import React from "react";
import { Subject } from "rxjs";
import { SuperMemoGrade } from "supermemo";

export interface QuizResult {
  word: string;
  grade: SuperMemoGrade;
}

export enum QuizComponent {
  Conclusion = "Conclusion",
  Characters = "Characters",
}

export class QuizResultService {
  quizResult$ = new Subject<QuizResult>();
  requestNextCard$ = new Subject<void>();
  constructor({
    wordRecognitionProgressService,
    scheduleRowsService,
    generalToastMessageService,
  }: {
    scheduleRowsService: QuizCardScheduleRowsService;
    wordRecognitionProgressService: WordRecognitionProgressRepository;
    generalToastMessageService: GeneralToastMessageService;
  }) {
    this.quizResult$
      .pipe(
        QuizResultToRecognitionRows(scheduleRowsService.indexedScheduleRows$)
      )
      .subscribe((record) => {
        /*
            generalToastMessageService.addToastMessage$.next(() => <Typography variant={'h6'}>
                {record.word} next due date {format(record.nextDueDate, "yyyy MMM-do HH:mm")}
            </Typography>)
*/
        wordRecognitionProgressService.addRecords$.next([record]);
      });
  }
  completeQuiz(word: string, recognitionScore: SuperMemoGrade) {
    this.quizResult$.next({
      grade: recognitionScore,
      word,
    });

    this.requestNextCard$.next();
  }
}
