import React, { useContext } from "react";
import { Paper } from "@material-ui/core";
import { useObservableState } from "observable-hooks";
import { QuizCard } from "./word-card.interface";
import { ManagerContext } from "../../App";
import { PaperProps } from "@material-ui/core/Paper/Paper";
import { QuizCardButtons } from "./quiz-card-buttons.component";
import { NoScheduleRows } from "./no-schedule-rows.component";
import { RevealedQuizCard } from "./card-types/revealed-quiz-card.component";
import { UnRevealedQuizCardComponent } from "./card-types/un-revealed-quiz-card.component";
import { EmittedValues, useVisibleObservableState } from "../UseVisilbleObservableState/UseVisibleObservableState";
import { LimitedScheduleRows } from "../../lib/manager/limit-schedule-rows.type";
import { useConcatArray } from "../../lib/util/useConcatArray";


export const useActiveFlashCardTypes = () => {
  const m = useContext(ManagerContext);
  return useObservableState(m.flashCardTypesRequiredToProgressService.activeFlashCardTypes$) || [];
};

export const QuizCardComponent: React.FC<{ quizCard: QuizCard } & PaperProps> = ({ quizCard, ...props }) => {
  const m = useContext(ManagerContext);
  const limitedScheduleRowData = useObservableState(m.sortedLimitedQuizScheduleRowsService.sortedLimitedScheduleRows$);
  const emittedScheduleRows = useVisibleObservableState<LimitedScheduleRows>(m.sortedLimitedQuizScheduleRowsService.sortedLimitedScheduleRows$, (rows) => `m.sortedLimitedQuizScheduleRowsService.sortedLimitedScheduleRows$: ${rows.limitedScheduleRows.slice(0,3).map(row => row.d.word).join(', ')}`);
  const answerIsRevealed = useObservableState(quizCard.answerIsRevealed$);
  const emittedAnswerIsRevealed = useVisibleObservableState<boolean>(quizCard.answerIsRevealed$, (quizCardIsRevealed) => `quizCard.answerIsRevealed$: ${quizCardIsRevealed ? 'true' : 'false'}`);
  const noScheduleRows = limitedScheduleRowData?.limitedScheduleRows?.length === 0;
  const cardLimitReached = limitedScheduleRowData?.scheduleRowsLeftForToday?.length === 0 &&
    noScheduleRows;
  const showNoScheduleRows = noScheduleRows || cardLimitReached;


  return (
    <Paper className="quiz-card" {...props}>
      <EmittedValues emittedValues={useConcatArray(emittedScheduleRows, emittedAnswerIsRevealed)} />
      {
        showNoScheduleRows && <NoScheduleRows />
      }
      {
        !showNoScheduleRows && (
          <div className={"quiz-card-revealed"}>
            {
              answerIsRevealed ?
                <RevealedQuizCard quizCard={quizCard} /> :
                <UnRevealedQuizCardComponent quizCard={quizCard} />
            }
            {/* This element only exists for spacing purposes */}
            <div style={{ flexGrow: 2 }} />
            <QuizCardButtons quizCard={quizCard} />
          </div>
        )
      }
    </Paper>
  );
};

