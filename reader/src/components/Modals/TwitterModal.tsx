import {Manager} from "../../lib/Manager/Manager";
import {useObs} from "../../UseObs";
import PostAddIcon from "@material-ui/icons/PostAdd";
import {Tweet} from "../../lib/Books/Tweet";
import {TextareaAutosize, TextField} from "@material-ui/core";
import React from "react";

export function TwitterModal({m}: { m: Manager }) {
    const twitterTitleInput = useObs(m.twitterUrl$);
    const twitterUrlInput = useObs(m.twitterTitle$);

    return <div>TODO</div>
}