import React from 'react';
import {makeStyles, Theme, createStyles} from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import {Card, Dialog} from "@material-ui/core";
import {useObservableState} from "observable-hooks";
import {NavModal} from "../../lib/nav-modal";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        modal: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',

        },
        card: {
            padding: theme.spacing(5),
            /*
                        border: '2px solid #000',
                        boxShadow: theme.shadows[5],
            */
        },
    }),
);

export const ActionModal: React.FC<{
    navModal: NavModal
}> = (
    {
        navModal,
        children
    }) => {
    const classes = useStyles();
    const open = !!useObservableState(navModal.open$)

    const handleClose = () => {
        navModal.open$.next(false);
    };

    return (
        <Dialog
            className={`action-modal ${classes.modal}`}
            open={open}
            onClose={handleClose}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
                timeout: 500,
            }}
        >
            <Card className={classes.card} style={{overflow: 'auto'}}>
                {children}
            </Card>
        </Dialog>
    );
}