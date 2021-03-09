import {EditableOnClick} from "./editable-image.component";
import {InsertPhoto} from '@material-ui/icons';
import React, {useCallback, useContext} from "react";
import {useObservableState} from "observable-hooks";
import {QuizCard, WordCard} from "./word-card.interface";
import {ManagerContext} from "../../App";
import {observableLastValue} from "../../services/settings.service";
import {IconButton} from "@material-ui/core";
import {quizCardImage, selectQuizCardImageButton} from "@shared/";
import {useIsFieldHidden} from "./useIsFieldHidden";

export function CardImage({quizCard}: { quizCard: WordCard }) {
    const quizCardImageSource = useObservableState(quizCard.image$.value$);
/*
    const isImageHidden = useIsFieldHidden({quizCard, label: 'picture'})
*/
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
            quizCardImageSource ?
                <img
                    className={quizCardImage}
                    src={quizCardImageSource}
                /> :
                <IconButton color='primary' id={selectQuizCardImageButton}>
                    <InsertPhoto id={'quiz-card-image-placeholder'}/>
                </IconButton>
        }

    </EditableOnClick>;
}