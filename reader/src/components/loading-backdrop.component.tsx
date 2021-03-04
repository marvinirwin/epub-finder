import {ManagerContext} from "../App";
import React, {useContext} from "react";
import {makeStyles} from "@material-ui/core/styles";
import {Backdrop, CircularProgress, createStyles, Theme, Typography} from "@material-ui/core";
import {useObservableState} from "observable-hooks";
import {loadingBackdropTypography} from '@shared/';
import {ProgressItemComponent} from "./progress-item.component";

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
    const thingsInProgress =  useObservableState(m.progressItemService.progressItems$);
    const classes = useStyles();
    return <Backdrop className={classes.backdrop} open={!!thingsInProgress?.size}>
        <CircularProgress id={'global-loading-spinner'} color="inherit" />
        <Typography id={loadingBackdropTypography}>
            {[...(thingsInProgress?.values()) || []]
                .map((t, i) => <ProgressItemComponent key={i} progressItem={t}/>)}
        </Typography>
    </Backdrop>
}