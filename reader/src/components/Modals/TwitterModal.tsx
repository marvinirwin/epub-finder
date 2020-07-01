import {Manager} from "../../lib/Manager";
import {useObs} from "../../lib/UseObs";
import PostAddIcon from "@material-ui/icons/PostAdd";
import {TextareaAutosize, TextField} from "@material-ui/core";
import React from "react";

export function TwitterModal({m}: { m: Manager }) {
    const twitterTitleInput = useObs(m.twitterUrl$);
    const twitterUrlInput = useObs(m.twitterTitle$);

    return <div>TODO</div>
}