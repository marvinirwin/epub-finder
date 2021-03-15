import React, {Fragment, useContext, useState} from "react";
import {ManagerContext} from "../../App";
import {Paper, TextField, Typography} from "@material-ui/core";
import {useObservableState, useSubscription} from "observable-hooks";
import {SuperMemoGrade} from "supermemo";
import {SrmService} from "../../lib/srm/srm.service";
import moment from "moment";
import {Observable} from "rxjs";
import {AdvanceButton} from "../quiz/quiz-card-buttons.component";
import {DifficultyButtons} from "./difficulty-buttons.component";
import {sumWordCountRecords} from "../../lib/schedule/schedule-math.service";

export const translateRequest = '';


export const TranslationAttempt: React.FC = () => {
    const m = useContext(ManagerContext);
    const translationText = useObservableState(m.translationAttemptService.currentTranslation$) || '';
    const knownLanguage = useObservableState(m.translationAttemptService.currentKnownLanguage$) || '';
    const currentRow = useObservableState(m.translationAttemptService.currentScheduleRow$);
    const answerIsShown = useObservableState(m.translationAttemptService.answerIsShown$)
    // TODO maybe filter by due date
    const [translateAttempt, setTranslateAttempt] = useState<string>('');
    const useQuizResult = (obs$: Observable<unknown>, grade: SuperMemoGrade) => {
        useSubscription(obs$, () => {
            const previousRows = currentRow?.d.translationAttemptRecords || [];
            const translationAttemptRow = SrmService.getNextRecognitionRecord(
                previousRows,
                grade
            );
            m.translationAttemptRepository.addRecords$.next([
                {
                    knownLanguage,
                    grade,
                    translationAttempt: translateAttempt,
                    timestamp: new Date(),
                    nextDueDate: moment().add(translationAttemptRow.interval, 'day').toDate(),
                    ...translationAttemptRow,
                }
            ])
        })
    }
    useQuizResult(m.hotkeyEvents.quizResultEasy$, 5)
    useQuizResult(m.hotkeyEvents.quizResultMedium$, 3)
    useQuizResult(m.hotkeyEvents.quizResultHard$, 1)
    useSubscription(m.hotkeyEvents.advanceQuiz$, () => m.translationAttemptService.answerIsShown$.next(true));
    const knownText = `You know ${sumWordCountRecords(currentRow?.d.wordCountRecords)} / ${}`;
    return <Paper style={{display: 'flex', flexFlow: 'column nowrap'}}>
        {
            knownLanguage &&
            <Fragment>
                <Typography variant={'h3'} style={{margin: '24px'}}>
                    {knownLanguage}
                </Typography>
                <TextField
                    label=
                    inputProps={{id: translateRequest}}
                    multiline
                    rows={3}
                    variant="filled"
                    value={translateAttempt}
                    onChange={e => setTranslateAttempt(e.target.value)}
                />
                {
                    answerIsShown ?
                        <DifficultyButtons/> :
                        <AdvanceButton/>
                }

            </Fragment>
        }
    </Paper>
}