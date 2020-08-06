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
    const [editingCard, setEditingCard] = useState<EditingCard | null>(null);
    useEffect(() => {
        setEditingCard(c ? EditingCard.fromICard(c, m.cardDBManager, m) : null)
    }, [c])

    return editingCard ? <Card className={classes.card}>
        <CardContent className={classes.cardContent}>
            <EditingCardComponent card={editingCard}/>
        </CardContent>
        {c && <CardActions className={classes.cardActions}>
            <Button onClick={() => m.quizManager.completeQuiz(c.learningLanguage, RecognitionMap.hard)}>Hard</Button>
            <Button onClick={() => m.quizManager.completeQuiz(c.learningLanguage, RecognitionMap.medium)}>Medium</Button>
            <Button onClick={() => m.quizManager.completeQuiz(c.learningLanguage, RecognitionMap.easy)}>Easy</Button>
        </CardActions>
        }
    </Card> : <div/>;
}