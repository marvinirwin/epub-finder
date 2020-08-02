import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import {ICard} from "../../lib/Interfaces/ICard";
import {Manager} from "../../lib/Manager";
import {useObs} from "../../lib/UseObs";
import {DialogContent} from "@material-ui/core";

export type QuizCardProps = { c: ICard, m: Manager }

export default function QuizDialogContainer({m}: { m: Manager }) {
    const quizzingCard = useObs(m.quizManager.quizzingCard$);

    function close() {
        m.quizManager.quizzingComponent$.next();
    }

    const Component = useObs(m.quizManager.quizzingComponent$);

    return <Dialog fullScreen onClose={close} aria-labelledby="customized-dialog-title" open={!!Component}>
        {/*
            <DialogTitle id="customized-dialog-title" onClose={() => m.quizDialogOpen$.next(false)}>

            </DialogTitle>
*/}
        <DialogContent dividers>
            {Component && quizzingCard ? <Component c={quizzingCard} m={m}/> : ''}
        </DialogContent>
    </Dialog>
}