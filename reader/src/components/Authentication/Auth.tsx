import {Paper, Slide} from "@material-ui/core";
import EditingCardComponent from "../Card/EditingCardComponent";
import React from "react";
import {useObservableState} from "observable-hooks";
import {Manager} from "../../lib/Manager";
import { Profile } from "./Profile";
import {LoginOptions} from "./LoginOptions";

export const Auth = ({m}: {m: Manager}) => {
    const showAuth = true;
    const user = useObservableState(m.authManager.user$);
    return <Slide direction="down" in={!!showAuth}>
        <Paper>
            {
                user ?
                    <Profile user={user}></Profile> :
                    <LoginOptions/>
            }
        </Paper>
    </Slide>
}