import React from 'react';
import {makeStyles, Theme, createStyles} from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import {Card} from "@material-ui/core";
import {NavModal} from "../../lib/modal.service";
import {useObservableState} from "observable-hooks";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        modal: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',

        },
        card: {
            padding: theme.spacing(5)
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
        <Modal
            id={'action-modal'}
            className={classes.modal}
            open={open}
            onClose={handleClose}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
                timeout: 500,
            }}
        >
            <Fade in={open}>
                <Card className={classes.card}>
                    {children}
                </Card>
            </Fade>
        </Modal>
    );
}