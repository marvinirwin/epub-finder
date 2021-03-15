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
import {
    wordListAverageDifficulty,
    wordsFromCountRecordList
} from "../../../../server/src/shared/tabulation/word-count-records.module";

export const translateRequest = '';


export const TranslationAttempt: React.FC = () => {
    const m = useContext(ManagerContext);
    const translationText = useObservableState(m.translationAttemptService.currentTranslation$) || '';
    const currentRomanization = useObservableState(m.translationAttemptService.currentRomanization$) || '';
    const learningLanguage = useObservableState(m.translationAttemptService.currentLearningLanguage$) || '';
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
                    learningLanguage,
                    grade,
                    translationAttempt: translateAttempt,
                    timestamp: new Date(),
                    nextDueDate: moment().add(translationAttemptRow.interval, 'day').toDate(),
                    ...translationAttemptRow,
                }
            ])
        })
    }
    const weightedVocab = useObservableState(m.weightedVocabService.weightedVocab$) || new Map();
    useQuizResult(m.hotkeyEvents.quizResultEasy$, 5)
    useQuizResult(m.hotkeyEvents.quizResultMedium$, 3)
    useQuizResult(m.hotkeyEvents.quizResultHard$, 1)
    useSubscription(m.hotkeyEvents.advanceQuiz$, () => m.translationAttemptService.answerIsShown$.next(true));
    const totalWords = wordsFromCountRecordList(currentRow?.d?.wordCountRecords || []);
    const average = wordListAverageDifficulty(
        totalWords,
        weightedVocab
    );
    const knownText = `There is an average difficulty ${average} of ${totalWords.length}`;
    return <Paper style={{display: 'flex', flexFlow: 'column nowrap'}}>
        {
            learningLanguage &&
            <Fragment>
                <Typography variant={'h3'} style={{margin: '24px'}}>
                    {translationText}
                </Typography>
                {answerIsShown && <Fragment>
                    <Typography variant={'h3'} style={{margin: '24px'}}>
                        {learningLanguage}
                    </Typography>
                    <Typography variant={'h3'} style={{margin: '24px', color: 'grey'}}>
                        {currentRomanization}
                    </Typography>
                </Fragment>}
                <TextField
                    label={knownText}
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