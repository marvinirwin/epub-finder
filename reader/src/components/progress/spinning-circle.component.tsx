import React from 'react';
import clsx from 'clsx';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import { green } from '@material-ui/core/colors';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import CheckIcon from '@material-ui/icons/Check';
import SaveIcon from '@material-ui/icons/Save';

const SuccessGreen = '#CCFCA7';
const InProgressGold = '#FCD09A';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: 'flex',
            alignItems: 'center',
        },
        wrapper: {
            margin: theme.spacing(1),
            position: 'relative',
        },
        buttonSuccess: {
            backgroundColor: theme.palette.primary.main,
            '&:hover': {
                backgroundColor: '#CCFCA7',
            },
        },
        fabProgress: {
            color: InProgressGold,
            position: 'absolute',
            top: -6,
            left: -6,
            zIndex: 1,
        },
        buttonProgress: {
            color: InProgressGold,
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginTop: -12,
            marginLeft: -12,
        },
    }),
);

export enum SpinnerState {
    InProgress,
    Success,
    Failure
}

export default function CircularIntegration({state, icon}: {state: SpinnerState, icon: React.ReactElement}) {
    const classes = useStyles();

    const buttonClassname = clsx({
        [classes.buttonSuccess]: state === SpinnerState.Success,
    });

    return (
        <div className={classes.root}>
            <div className={classes.wrapper}>
                <Fab
                    aria-label="save"
                    color="primary"
                    className={buttonClassname}
                >
                    {icon}
                </Fab>
                {state === SpinnerState.InProgress && <CircularProgress size={68} className={classes.fabProgress} />}
            </div>
        </div>
    );
}