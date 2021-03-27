import {NormalizedQuizCardScheduleRowData, ScheduleRow} from "./schedule-row";
import React from "react";
import {DisplaySortValue} from "./schedule-row-math.component";
import {useObservableState} from "observable-hooks";
import {QuizCard} from "../../components/quiz/word-card.interface";
import {TextField, Typography} from "@material-ui/core";
import {quizCardDescription, quizCardRomanization, quizCardTranslation} from "@shared/";
import {useIsFieldHidden} from "../../components/quiz/useIsFieldHidden";
import {sumWordCountRecords} from "./schedule-math.service";
import {QuizCardScheduleTable} from "../../components/tables/quiz-card-due-date-schedule-table.component";
import {DEV} from "../util/url-params";

export const QuizCardScheduleRowDisplay = (
    {
        scheduleRow,
        quizCard
    }: {
        scheduleRow: ScheduleRow<NormalizedQuizCardScheduleRowData>,
        quizCard: QuizCard
    }) => {
    const description = useObservableState(quizCard.description$.value$);
    const romanization = useObservableState(quizCard.romanization$);
    const translation = useObservableState(quizCard.translation$);
    const isDescriptionHidden = useIsFieldHidden({quizCard, label: 'description'});
    const isRomanizationHidden = useIsFieldHidden({quizCard, label: 'romanization'});
    const isDefinitionHidden = useIsFieldHidden({quizCard, label: 'definition'});
    return <div>
        {!isDescriptionHidden && <QuizCardScheduleTable/>}
        <div style={{marginTop: '24px'}}>
            <Typography variant='h4' className={quizCardRomanization}>
                {isRomanizationHidden ? '' : romanization}
            </Typography>
            <br/>
            <Typography variant='h4' className={quizCardTranslation}>
                {isDefinitionHidden ? '' : translation}
            </Typography>
        </div>
        <div style={{marginTop: '24px', marginBottom: '24px'}}>
            {
                isDescriptionHidden ? '' :
                    <TextField
                        label="Description"
                        inputProps={{className: quizCardDescription}}
                        multiline
                        rows={3}
                        variant="filled"
                        value={description}
                        onChange={e => quizCard.description$.set(e.target.value)}
                    />
            }
        </div>
    </div>
}
