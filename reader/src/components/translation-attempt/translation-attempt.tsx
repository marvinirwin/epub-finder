import React, {useContext, useState, Fragment, useEffect} from "react";
import {ManagerContext} from "../../App";
import {Button, Paper, TextField, Typography} from "@material-ui/core";
import {useObservableState, useSubscription} from "observable-hooks";
import {SuperMemoGrade} from "supermemo";
import {SrmService} from "../../lib/srm/srm.service";
import moment from "moment";
import {HotkeyWrapper} from "../hotkey-wrapper";
import {QUIZ_BUTTON_EASY, QUIZ_BUTTON_HARD, QUIZ_BUTTON_IGNORE, QUIZ_BUTTON_MEDIUM} from "@shared/";
import {Observable} from "rxjs";
import {AdvanceButton} from "../quiz/quiz-card-buttons.component";

const translateRequest = '';

export const DifficultyButtons = () => {
    const m = useContext(ManagerContext)
    return <Fragment>
        <HotkeyWrapper action={"QUIZ_RESULT_HARD"}>
            <Button
                className={QUIZ_BUTTON_HARD}
                onClick={() => m.hotkeyEvents.quizResultHard$.next()}>
                Hard
            </Button>
        </HotkeyWrapper>
        <HotkeyWrapper action={"QUIZ_RESULT_MEDIUM"}>
            <Button
                className={QUIZ_BUTTON_MEDIUM}
                onClick={() => m.hotkeyEvents.quizResultMedium$.next()}>
                Medium
            </Button>
        </HotkeyWrapper>
        <HotkeyWrapper action={"QUIZ_RESULT_EASY"}> <Button
            className={QUIZ_BUTTON_EASY}
            onClick={() => m.hotkeyEvents.quizResultEasy$.next()}
        >
            Easy
        </Button>
        </HotkeyWrapper>
        <HotkeyWrapper action={"QUIZ_RESULT_IGNORE"}>
            <Button
                className={QUIZ_BUTTON_IGNORE}
                onClick={() => {
                    m.hotkeyEvents.quizResultIgnore$.next()
                }}>
                Ignore
            </Button>
        </HotkeyWrapper>
    </Fragment>
};

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
    useSubscription(m.hotkeyEvents.advanceQuiz$, () => m.translationAttemptService.answerIsShown$.next(true))
    return <Paper>
        {
            knownLanguage &&
            <Fragment>
                <Typography>
                    {knownLanguage}
                </Typography>
                <TextField
                    label="Translate"
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