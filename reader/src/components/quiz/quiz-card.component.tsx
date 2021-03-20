import React, {useContext, Fragment} from "react";
import {Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography} from "@material-ui/core";
import {useObservableState, useSubscription} from "observable-hooks";
import {OpenDocumentComponent} from "../../lib/atomized/open-document.component";
import {QuizCard} from "./word-card.interface";
import {ManagerContext} from "../../App";
import {PaperProps} from "@material-ui/core/Paper/Paper";
import {CardImage} from "./quiz-card-image.component";
import {observableLastValue} from "../../services/settings.service";
import {flatten, uniq, round} from "lodash";
import {CardInfo} from "../../lib/schedule/quiz-card-current-card-info.component";
import {QuizCardProgress} from "../../lib/schedule/quiz-card-progress.component";
import {QuizCardButtons} from "./quiz-card-buttons.component";
import {useIsFieldHidden} from "./useIsFieldHidden";
import {QuizCardLimitReached} from "./empty-quiz-card.component";
import {CardLearningLanguageText} from "../word-paper.component";
import {Observable, Subject} from "rxjs";
import {SuperMemoGrade} from "supermemo";
import {format} from "date-fns";


export const QuizCardScheduleTable = () => {
    const m = useContext(ManagerContext);
    const rows = useObservableState(m.sortedLimitedQuizScheduleRowsService.sortedLimitedScheduleRows$)
        ?.limitedScheduleRows || []
    return <TableContainer component={Paper}>
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell>Word</TableCell>
                    <TableCell align="right">DueDate</TableCell>
{/*
                    <TableCell align="right">Count</TableCell>
                    <TableCell align="right">Sentence Priority</TableCell>
                    <TableCell align="right">Length</TableCell>
*/}
                </TableRow>
            </TableHead>
            <TableBody>
                {rows.slice(0, 3).map((row) => (
                    <TableRow key={row.d.word}>
                        <TableCell component="th" scope="row">
                            {row.d.word}
                        </TableCell>
                        <TableCell align="right">
                            {format(row.dueDate(), "yyyy MMM-do HH:mm")} &nbsp;
                            {round(row.d.sortValues.dueDate.weightedInverseLogNormalValue, 2)}
                        </TableCell>
{/*
                        <TableCell align="right">
                            {row.d.sortValues.count.value}&nbsp;
                            {round(row.d.sortValues.count.weightedInverseLogNormalValue, 2)}
                        </TableCell>
                        <TableCell align="right">
                            {row.d.sortValues.sentencePriority.value}&nbsp;
                            {round(row.d.sortValues.sentencePriority.weightedInverseLogNormalValue, 2)}
                        </TableCell>
                        <TableCell align="right">
                            {row.d.sortValues.length.value}&nbsp;
                            {round(row.d.sortValues.length.weightedInverseLogNormalValue, 2)}
                        </TableCell>
*/}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </TableContainer>
}

export const QuizCardTranslationAttemptSchedule = () => {
    const m = useContext(ManagerContext);
    const rows = Object.values(useObservableState(m.translationAttemptScheduleService.indexedScheduleRows$) || {});

    return <TableContainer component={Paper}>
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell>Sentence</TableCell>
                    <TableCell align="right">Due Date</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {rows.slice(0, 3).map((row) => (
                    <TableRow key={row.d.segmentText}>
                        <TableCell component="th" scope="row">
                            {row.d.segmentText}
                        </TableCell>
                        <TableCell align="right">
                            {format(row.dueDate(), 'yyyy MMM-do HH:mm')}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </TableContainer>
}

export const QuizCardComponent: React.FC<{ quizCard: QuizCard } & PaperProps> = ({quizCard, ...props}) => {
    const word = useObservableState(quizCard.word$);
    const m = useContext(ManagerContext);
    const isLearningLanguageHidden = useIsFieldHidden({quizCard, label: 'learningLanguage'})

    const useQuizResult = (obs$: Observable<unknown>, score: SuperMemoGrade) => {
        useSubscription(obs$, () => {
            if (word) {
                m.quizManager.completeQuiz(word, score)
            }
        })
    }
    useQuizResult(m.hotkeyEvents.quizResultEasy$, 5)
    useQuizResult(m.hotkeyEvents.quizResultMedium$, 3)
    useQuizResult(m.hotkeyEvents.quizResultHard$, 1)
    useSubscription(m.hotkeyEvents.quizResultIgnore$, () => {
        if (word) {
            m.ignoredWordsRepository
                .addRecords$.next([{word, timestamp: new Date()}])
        }
    })
    const cardsLearnedToday = useObservableState(m.quizCardScheduleService.cardsLearnedToday$)?.length || 0;
    const cardLimit = useObservableState(m.settingsService.newQuizWordLimit$) || 0;
    const cardLimitReached = cardsLearnedToday >= cardLimit;
    const answerIsRevealed = useObservableState(quizCard.answerIsRevealed$);
    return <Paper className='quiz-card' {...props}>
        {
            !cardLimitReached ?
                <Fragment>
                    <div className={'quiz-card-data-sheet'}>
                        <div>
                            <QuizCardTranslationAttemptSchedule/>
{/*
                            <QuizCardProgress quizCard={quizCard}/>
*/}
                        </div>
                        <div className={'quiz-card-data-sheet-middle'}>
                            <CardImage quizCard={quizCard}/>
                            {
                                !isLearningLanguageHidden && <CardLearningLanguageText word={word || ''}/>
                            }
                        </div>
                        <div>
                            {!answerIsRevealed && <QuizCardScheduleTable/>}
                            {<CardInfo quizCard={quizCard}/>}
                        </div>
                    </div>
                    <OpenDocumentComponent openedDocument={quizCard.exampleSentenceOpenDocument}/>
                    <QuizCardButtons quizCard={quizCard}/>
                </Fragment> :
                <QuizCardLimitReached/>
        }


    </Paper>
}