import React, {useEffect, useState} from 'react';
import {withStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import {ICard} from "../lib/Interfaces/ICard";
import {Manager} from "../lib/Manager/Manager";
import {useObs} from "../UseObs";
import {
    Card,
    CardActions,
    CardContent,
    DialogActions,
    DialogContent,
    DialogTitle,
    GridList,
    ListSubheader, TextField
} from "@material-ui/core";
import EditingCardComponent from "./EditingCard/EditingCardComponent";
import {EditingCard} from "../lib/ReactiveClasses/EditingCard";
import CardImageList from "./CardImageList";
import {EditingImage} from "./EditingImage";
import GridListTileBar from "@material-ui/core/GridListTileBar";
import DeleteIcon from "@material-ui/icons/Delete";
import LibraryAddIcon from "@material-ui/icons/LibraryAdd";
import GridListTile from "@material-ui/core/GridListTile";

export type QuizCardProps = { c: ICard, m: Manager }

export function ShowCharacter({c, m}: QuizCardProps) {
    return <Card>
        <CardContent>
            <Typography variant="h1" component="h1">
                {c.learningLanguage}
            </Typography>
        </CardContent>
        <CardActions>
            <Button onClick={() => m.quizDialogComponent$.next(CardPictureScreen)}>Next</Button>

        </CardActions>
    </Card>
}


function CardPictureScreen({c, m}: QuizCardProps) {
    return <Card>
        <CardContent>
            <GridList>
                {c.photos.map((src: string, index: number) =>
                    <GridListTile key={src}>
                        <img src={src}/>
                    </GridListTile>
                )}
            </GridList>
        </CardContent>
        <CardActions>
            <Button onClick={() => m.quizDialogComponent$.next(EditCardScreen)}>Next</Button>
        </CardActions>
    </Card>;
}

function EditCardScreen({c, m}: QuizCardProps) {
    function sendWordRec(recognitionScore: number) {
        m.addUnpersistedWordRecognitionRows$.next([
            {
                word: c.learningLanguage,
                timestamp: new Date(),
                recognitionScore
            }
        ])
        m.quizDialogComponent$.next()
    }

    const [editingCard, setEditingCard] = useState<EditingCard | null>(null);
    useEffect(() => {
        setEditingCard(EditingCard.fromICard(c, m.cardDBManager, m))
    }, [])

    return editingCard ? <Card>
        <CardContent>
            <EditingCardComponent card={editingCard}/>
        </CardContent>
        <CardActions>
            <Button onClick={() => sendWordRec(1)}>1</Button>
            <Button onClick={() => sendWordRec(50)}>2</Button>
            <Button onClick={() => sendWordRec(100)}>3</Button>
        </CardActions>
    </Card> : <div/>;
}

export default function QuickDIalogContainer({m}: { m: Manager }) {
    const open = useObs(m.quizDialogComponent$)
    const quizzingCard = useObs(m.quizzingCard$);

    function close() {
        m.quizDialogComponent$.next();
    }

    const Component = useObs(m.quizDialogComponent$);


    return <Dialog fullScreen onClose={close} aria-labelledby="customized-dialog-title" open={!!open}>
        {/*
            <DialogTitle id="customized-dialog-title" onClose={() => m.quizDialogOpen$.next(false)}>

            </DialogTitle>
*/}
        <DialogContent dividers>
            {Component && quizzingCard ? <Component c={quizzingCard} m={m}/> : ''}
        </DialogContent>
        <DialogActions>
            <Button autoFocus onClick={close} color="primary">
                Save changes
            </Button>
        </DialogActions>
    </Dialog>
}