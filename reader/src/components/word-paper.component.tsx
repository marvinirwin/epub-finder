import {WordCard} from "./quiz/word-card.interface";
import React, {useContext} from "react";
import {Paper, Typography} from "@material-ui/core";
import {CardImage} from "./quiz/quiz-card-image.component";
import {quizCardLearningLanguage, quizCardRomanization, quizCardTranslation} from "@shared/*";
import {useObservableState} from "observable-hooks";
import {QuizCardScheduleRowDisplay} from "../lib/schedule/quiz-card-schedule-row.component";
import {ManagerContext} from "../App";


export const CardLearningLanguageText = ({word}: { word: string }) => {
    return <Typography
        variant={'h1'}
        className={quizCardLearningLanguage}
    >{word || ''}</Typography>
}

export const WordPaperComponent: React.FC<{ wordCard: WordCard }> = ({wordCard}) => {
    const m = useContext(ManagerContext);
    const word = useObservableState(wordCard.word$);
    const scheduleRows = useObservableState(m.scheduleRowsService.indexedScheduleRows$) || {};
    const scheduleRow = scheduleRows[word || ''];
    const romanization = useObservableState(wordCard.romanization$);
    const translation = useObservableState(wordCard.translation$);
    return <Paper>
        <CardImage quizCard={wordCard}/>
        <CardLearningLanguageText word={word || ''}/>
        <Typography variant='h4' className={quizCardRomanization}>
            {romanization}
        </Typography>
        <br/>
        <Typography variant='h4' className={quizCardTranslation}>
            {translation}
        </Typography>

    </Paper>
}