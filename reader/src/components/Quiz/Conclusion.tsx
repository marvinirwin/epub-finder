import React, {useEffect, useState} from "react";
import {EditingCard} from "../../lib/ReactiveClasses/EditingCard";
import {Card, CardActions, CardContent} from "@material-ui/core";
import EditingCardComponent from "../EditingCard/EditingCardComponent";
import Button from "@material-ui/core/Button";
import {QuizCardProps} from "./Popup";
import {quizStyles} from "./QuizStyles";
import {RecognitionMap} from "../../lib/Scheduling/SRM";

export function Conclusion({c, m}: QuizCardProps) {
    const classes = quizStyles();

    function sendWordRec(recognitionScore: number) {
        m.quizManager.completedQuizItem$.next({
            score: recognitionScore,
            word: c.learningLanguage
        })
        m.quizManager.currentQuizDialogComponent$.next()
    }

    const [editingCard, setEditingCard] = useState<EditingCard | null>(null);
    useEffect(() => {
        setEditingCard(EditingCard.fromICard(c, m.cardDBManager, m))
    }, [])

    return editingCard ? <Card className={classes.card}>
        <CardContent className={classes.cardContent}>
            <EditingCardComponent card={editingCard}/>
        </CardContent>
        <CardActions className={classes.cardActions}>
            <Button onClick={() => sendWordRec(RecognitionMap.hard)}>Hard</Button>
            <Button onClick={() => sendWordRec(RecognitionMap.medium)}>Medium</Button>
            <Button onClick={() => sendWordRec(RecognitionMap.easy)}>Easy</Button>
        </CardActions>
    </Card> : <div/>;
}