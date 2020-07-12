import {Card, CardActions, CardContent} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import React from "react";
import {QuizCardProps} from "./Popup";
import {CardPictureScreen} from "./Pictures";
import {quizStyles} from "./QuizStyles";



export function Characters({c, m}: QuizCardProps) {
    const classes = quizStyles();
    return <Card className={classes.card}>
        <CardContent className={classes.cardContent}>
            <Typography variant="h1" component="h1" className={classes.center}>
                {c.learningLanguage}
            </Typography>
        </CardContent>
        <CardActions className={classes.cardActions}>
            <Button onClick={() => m.quizManager.currentQuizDialogComponent$.next(CardPictureScreen)}>Next</Button>
        </CardActions>
    </Card>
}