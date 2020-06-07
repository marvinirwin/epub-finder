import React, {FunctionComponent, ReactComponentElement, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import IconButton from "@material-ui/core/IconButton";

const useStyles = makeStyles((theme) => ({
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    paper: {
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
}));

interface TextModalBody {
    close: () => void
}

interface Created1 {
    icon: ReactComponentElement<any>;
    submit: (...args: any[]) => any;
}

const MyModal: FunctionComponent<Created1> = function TransitionsModal({icon, submit, children}) {
    const classes = useStyles();
    const [open, setOpen] = useState(false);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <div>
            <IconButton
                edge="start"
                color="inherit"
                onClick={handleOpen} > {icon} </IconButton>
            <Modal
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                className={classes.modal}
                open={open}
                onClose={handleClose}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                }} >
                <Fade in={open}>
                    <div className={classes.paper}>
                        {children}
                        <button onClick={() => {handleClose(); submit()}}>Submit</button>
                    </div>
                </Fade>
            </Modal>
        </div>
    );
}
export default MyModal;