import {EditableOnClick} from "./editable-image.component";
import {TextField, Typography} from "@material-ui/core";
import React, {useState} from "react";
import {useObservableState} from "observable-hooks";
import {QuizCard} from "./word-card.interface";

export function QuizCardKnownLanguage({c}: { c: QuizCard }) {
    const description = useObservableState(c.description$.value$);
    return <TextField
        inputProps={{className: 'known-language'}}
        value={description}
        onChange={v => c.description$.setValue$.next(v.target.value)}
    />
/*
    return <EditableOnClick onEditClicked={() => setIsEditing(true)}>
        {
            isEditing ?
                 :
                <Typography className={"known-language"}>
                    {description || "No description"}
                </Typography>
        }
*/

/*
    </EditableOnClick>;
*/
}