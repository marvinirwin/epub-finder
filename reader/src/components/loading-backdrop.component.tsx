import {ManagerContext} from "../App";
import React, {useContext} from "react";
import {makeStyles} from "@material-ui/core/styles";
import {Backdrop, CircularProgress, createStyles, Theme} from "@material-ui/core";
import {useObservableState} from "observable-hooks";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        backdrop: {
            zIndex: theme.zIndex.drawer + 1,
            color: '#fff',
        },
    }),
);

export const LoadingBackdrop = () => {
    const m = useContext(ManagerContext);
    const thingsInProgress =  useObservableState(m.progressItemsService.progressItems$);
    const classes = useStyles();
    return <Backdrop className={classes.backdrop} open={!!thingsInProgress?.size}>
        <CircularProgress id={'global-loading-spinner'} color="inherit" />
    </Backdrop>
}