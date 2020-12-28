import {EditableOnClick} from "./editable-image.component";
import React, {useCallback, useContext} from "react";
import {useObservableState} from "observable-hooks";
import {QuizCard} from "./quiz-card.interface";
import {ManagerContext} from "../../App";
import {observableLastValue} from "../../services/settings.service";

export function QuizCardImage({c}: {c: QuizCard}) {
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
        <img className={"quiz-card-image"} src={source}/>
    </EditableOnClick>;
}