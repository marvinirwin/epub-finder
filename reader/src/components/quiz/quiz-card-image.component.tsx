import {EditableOnClick} from "./editable-image.component";
import React from "react";
import {useObservableState} from "observable-hooks";
import {QuizCard} from "./quiz-card.interface";

export function QuizCardImage({c}: {c: QuizCard}) {
    const source = useObservableState(c.image$.value$);
    return <EditableOnClick onEditClicked={() => {}}>
        <img className={"quiz-card-image"} src={source}/>
    </EditableOnClick>;
}