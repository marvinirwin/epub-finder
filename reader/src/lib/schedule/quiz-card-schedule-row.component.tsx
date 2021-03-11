import {NormalizedScheduleRowData, ScheduleRow} from "./schedule-row";
import React from "react";
import {DEV} from "../../components/directory/app-directory-service";
import {DisplaySortValue} from "./schedule-row-math.component";
import {useObservableState} from "observable-hooks";
import {QuizCard} from "../../components/quiz/word-card.interface";
import {TextField, Typography} from "@material-ui/core";
import {quizCardDescription, quizCardRomanization, quizCardTranslation} from "@shared/";
import {useIsFieldHidden} from "../../components/quiz/useIsFieldHidden";

export const QuizCardScheduleRowDisplay = (
    {
        scheduleRow,
        quizCard
    }: {
        scheduleRow: ScheduleRow<NormalizedScheduleRowData>,
        quizCard: QuizCard
    }) => {
    const description = useObservableState(quizCard.description$.value$);
    const romanization = useObservableState(quizCard.romanization$);
    const translation = useObservableState(quizCard.translation$);
    const hiddenFields = useObservableState(quizCard.hiddenFields$) || new Set();
    const isDescriptionHidden = useIsFieldHidden({quizCard, label: 'description'});
    const isRomanizationHidden = useIsFieldHidden({quizCard, label: 'romanization'});
    const isDefinitionHidden = useIsFieldHidden({quizCard, label: 'definition'});
    return <div>
        <div style={{marginTop: '24px'}}>
            Due: {scheduleRow.dueIn()}
            {DEV && <DisplaySortValue sortValue={scheduleRow.d.dueDate}/>}
        </div>
        <div style={{marginTop: '24px'}}>
            Frequency: {scheduleRow.count()}
            {DEV && <div>Hidden Fields: {JSON.stringify([...hiddenFields.values()])}</div>}
            {DEV && <DisplaySortValue sortValue={scheduleRow.d.count}/>}
        </div>
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
