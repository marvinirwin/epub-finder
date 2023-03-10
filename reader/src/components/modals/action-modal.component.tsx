import React from 'react'
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles'
import Backdrop from '@material-ui/core/Backdrop'
import { useObservableState } from 'observable-hooks'
import { NavModal } from '../../lib/user-interface/nav-modal'
import {Modal} from 'flowbite-react';

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
)

export const ActionModal: React.FC<{
    navModal: NavModal,
    children?: React.ReactNode
}> = ({ navModal, children }) => {
    const classes = useStyles()
    const open = !!useObservableState(navModal.open$)

    const handleClose = () => {
        navModal.open$.next(false)
    }

    return (
        <Modal
            show={open}
            className={`action-modal ${classes.modal}`}
            style={{width: '90vw', height: '90vh'}}
            onClose={handleClose}
        >
            {children}
        </Modal>
    )
}
