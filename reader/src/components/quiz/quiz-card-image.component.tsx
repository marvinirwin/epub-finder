import {EditableOnClick} from "./editable-image.component";
import {InsertPhoto} from '@material-ui/icons';
import React, {useCallback, useContext} from "react";
import {useObservableState} from "observable-hooks";
import {QuizCard} from "./quiz-card.interface";
import {ManagerContext} from "../../App";
import {observableLastValue} from "../../services/settings.service";
import {IconButton} from "@material-ui/core";

export function QuizCardImage({quizCard}: { quizCard: QuizCard }) {
    const quizCardImageSource = useObservableState(quizCard.image$.value$);
    const hiddenFields = useObservableState(quizCard.hiddenFields$) || new Set();
    const m = useContext(ManagerContext);
    return <EditableOnClick onEditClicked={async () => {
        const searchTerm = await observableLastValue(quizCard.word$);
        if (searchTerm) {
            m.imageSearchService.queryImageRequest$.next({
                term: searchTerm,
                cb: v => quizCard.image$.set(v)
            });
        }
    }}>
        {
            !hiddenFields.has('picture') && quizCardImageSource ?
                <img className={"quiz-card-image"} src={quizCardImageSource}/> :
                <IconButton color='primary'>
                    <InsertPhoto id={'quiz-card-image-placeholder'}/>
                </IconButton>
        }

    </EditableOnClick>;
}