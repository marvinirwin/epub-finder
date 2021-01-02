import {EditableOnClick} from "./editable-image.component";
import {InsertPhoto} from '@material-ui/icons';
import React, {useCallback, useContext} from "react";
import {useObservableState} from "observable-hooks";
import {QuizCard} from "./quiz-card.interface";
import {ManagerContext} from "../../App";
import {observableLastValue} from "../../services/settings.service";
import {IconButton} from "@material-ui/core";

export function QuizCardImage({c}: { c: QuizCard }) {
    const source = useObservableState(c.image$.value$);
    const m = useContext(ManagerContext);
    return <EditableOnClick onEditClicked={async () => {
        const searchTerm = await observableLastValue(c.word$);
        if (searchTerm) {
            m.imageSearchService.queryImageRequest$.next({
                term: searchTerm,
                cb: v => c.image$.set(v)
            });
        }
    }}>
        {
            source ?
                <img className={"quiz-card-image"} src={source}/> :
                <InsertPhoto id={'quiz-card-image-placeholder'}/>
        }

    </EditableOnClick>;
}