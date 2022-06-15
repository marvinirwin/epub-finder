import React, { useContext } from "react";
import { Typography } from "@material-ui/core";
import { useDictionaryDefinition } from "../../../lib/util/useDictionaryDefinition";
import { useLoadingObservable } from "../../../lib/util/create-loading-observable";
import usePromise from "react-use-promise";
import { ManagerContext } from "../../../App";

export const DictionaryDefinition = (
    {
        word
    }: {
        word: string
    }
) => {
    const {definition, emittedValues} = useDictionaryDefinition(word);
    return <Typography variant='subtitle1'>
        {definition}
    </Typography>
}