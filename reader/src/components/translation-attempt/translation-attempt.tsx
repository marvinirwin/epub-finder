import React, {useContext, useState, Fragment, useEffect} from "react";
import {ManagerContext} from "../../App";
import {Button, Paper, TextField, Typography} from "@material-ui/core";
import {useObservableState} from "observable-hooks";
import {SuperMemoGrade} from "supermemo";
import {fetchTranslation} from "../../services/translate.service";
import {SrmService} from "../../lib/srm/srm.service";
import moment from "moment";
import {HotkeyWrapper} from "../hotkey-wrapper";
import {QUIZ_BUTTON_EASY, QUIZ_BUTTON_HARD, QUIZ_BUTTON_IGNORE, QUIZ_BUTTON_MEDIUM} from "@shared/*";

const translateRequest = '';

const DifficultyButtons = (props: { submit: (grade: SuperMemoGrade) => void }) => {
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
        <Button
            className={QUIZ_BUTTON_IGNORE}
            onClick={() => {
                if (word) {
                    m.ignoredWordsRepository.addRecords$.next([{word, timestamp: new Date()}])
                }
            }}>
            Ignore
        </Button>
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
                        <DifficultyButtons
                            submit={grade => {
                                const previousRows = currentRow?.d.translationAttemptRecords || [];
                                const recognitionRow = SrmService.getNextRecognitionRecord(
                                    previousRows,
                                    grade
                                );
                                m.translationAttemptRepository.addRecords$.next([
                                    {
                                        knownLanguage,
                                        grade,
                                        translationAttempt: translateAttempt,
                                        timestamp: new Date(),
                                        nextDueDate: moment().add(recognitionRow.interval, 'day').toDate(),
                                        ...recognitionRow,
                                    }
                                ])
                            }
                            }
                        /> :
                        <Button
                            onClick={() => {
                                m.translationAttemptService.answerIsShown$.next(true);
                            }
                            }
                        >Show</Button>
                }

            </Fragment>
        }
    </Paper>
}