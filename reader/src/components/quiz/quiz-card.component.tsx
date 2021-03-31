import React, { Fragment, useContext } from "react";
import { Paper } from "@material-ui/core";
import { useObservableState, useSubscription } from "observable-hooks";
import { QuizCard } from "./word-card.interface";
import { ManagerContext } from "../../App";
import { PaperProps } from "@material-ui/core/Paper/Paper";
import { CardImage } from "./quiz-card-image.component";
import { CardInfo } from "../../lib/schedule/quiz-card-current-card-info.component";
import { QuizCardButtons } from "./quiz-card-buttons.component";
import { useIsFieldHidden } from "./useIsFieldHidden";
import { QuizCardLimitReached } from "./empty-quiz-card.component";
import { CardLearningLanguageText } from "../word-information/word-paper.component";
import { Observable } from "rxjs";
import { SuperMemoGrade } from "supermemo";
import { QuizCardScheduleTable } from "../tables/quiz-card-due-date-schedule-table.component";
import { QuizCardTranslationAttemptSchedule } from "../tables/quiz-card-translation-attempt-table.component";
import { OpenDocumentComponent } from "../reading/open-document.component";

export const QuizCardComponent: React.FC<
  { quizCard: QuizCard } & PaperProps
> = ({ quizCard, ...props }) => {
  const word = useObservableState(quizCard.word$);
  const m = useContext(ManagerContext);
  const isLearningLanguageHidden = useIsFieldHidden({
    quizCard,
    label: "learningLanguage",
  });

  const useQuizResult = (obs$: Observable<unknown>, score: SuperMemoGrade) => {
    useSubscription(obs$, () => {
      if (word) {
        m.quizResultService.completeQuiz(word, score);
      }
    });
  };
  useQuizResult(m.hotkeyEvents.quizResultEasy$, 5);
  useQuizResult(m.hotkeyEvents.quizResultMedium$, 3);
  useQuizResult(m.hotkeyEvents.quizResultHard$, 1);
  useSubscription(m.hotkeyEvents.quizResultIgnore$, () => {
    if (word) {
      m.ignoredWordsRepository.addRecords$.next([
        { word, timestamp: new Date() },
      ]);
    }
  });
  const cardsLearnedToday =
    useObservableState(m.quizCardScheduleService.cardsLearnedToday$)?.length ||
    0;
  const cardLimit =
    useObservableState(m.settingsService.newQuizWordLimit$) || 0;
  const cardLimitReached = cardsLearnedToday >= cardLimit;
  const answerIsRevealed = useObservableState(quizCard.answerIsRevealed$);
  return (
    <Paper className="quiz-card" {...props}>
      {!cardLimitReached ? (
        <Fragment>
          <div className={"quiz-card-data-sheet"}>
            <div>
              <QuizCardTranslationAttemptSchedule />
              {/*
                            <QuizCardProgress quizCard={quizCard}/>
*/}
            </div>
            <div className={"quiz-card-data-sheet-middle"}>
              <CardImage quizCard={quizCard} />
              {!isLearningLanguageHidden && (
                <CardLearningLanguageText word={word || ""} />
              )}
            </div>
            <div>
              {!answerIsRevealed && <QuizCardScheduleTable />}
              {<CardInfo quizCard={quizCard} />}
            </div>
          </div>
          <OpenDocumentComponent
            openedDocument={quizCard.exampleSentenceOpenDocument}
          />
          <QuizCardButtons quizCard={quizCard} />
        </Fragment>
      ) : (
        <QuizCardLimitReached />
      )}
    </Paper>
  );
};
