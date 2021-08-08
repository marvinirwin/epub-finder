import React, {useContext} from "react";
import {ManagerContext} from "../../../App";
import {useLoadingObservable} from "../../../lib/util/create-loading-observable";
import usePromise from "react-use-promise";
import {Typography} from "@material-ui/core";

export const DictionaryDefinition = (
    {
        word
    }: {
        word: string
    }
) => {
    const m = useContext(ManagerContext);
    const dictionary = useLoadingObservable(m.dictionaryService.dictionary);
    const [definition] = usePromise(async () => {
        if (dictionary?.value && word) {
            debugger;
            return dictionary.value.getDefinition(word)
        }
    }, [word, dictionary])
    return <Typography variant='subtitle1'>
        {definition}
    </Typography>
}