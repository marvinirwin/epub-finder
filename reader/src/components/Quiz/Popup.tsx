import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import {ICard} from "../../lib/Interfaces/ICard";
import {Manager} from "../../lib/Manager";
import {useObs} from "../../lib/UseObs";
import {useObservableState} from "observable-hooks";

export type QuizCardProps = { c: ICard | undefined, m: Manager};

export default function QuizDialogContainer({m}: { m: Manager }) {
    const quizzingCard = useObservableState(m.quizManager.quizzingCard$);

    function close() {
        m.quizManager.quizStage.next();
    }

    const Component = useObservableState(m.quizManager.quizStage);

    return <Dialog fullScreen onClose={close} aria-labelledby="customized-dialog-title" open={!!Component}>
        {/*
            <DialogTitle id="customized-dialog-title" onClose={() => m.quizDialogOpen$.next(false)}>

            </DialogTitle>
*/}
{/*
        <DialogContent dividers>
            {Component && quizzingCard ? <Component c={quizzingCard} m={m}/> : ''}
        </DialogContent>
*/}
    </Dialog>
}