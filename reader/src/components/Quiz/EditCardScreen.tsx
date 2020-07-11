import React, {useEffect, useState} from "react";
import {EditingCard} from "../../lib/ReactiveClasses/EditingCard";
import {Card, CardActions, CardContent} from "@material-ui/core";
import EditingCardComponent from "../EditingCard/EditingCardComponent";
import Button from "@material-ui/core/Button";
import {QuizCardProps} from "../QuizPopup";

export function EditCardScreen({c, m}: QuizCardProps) {
    function sendWordRec(recognitionScore: number) {
        m.scheduleManager.addUnpersistedWordRecognitionRows$.next([
            {
                word: c.learningLanguage,
                timestamp: new Date(),
                recognitionScore
            }
        ])
        m.quizManager.currentQuizDialogComponent$.next()
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