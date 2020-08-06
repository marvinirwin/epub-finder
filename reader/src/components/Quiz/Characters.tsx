import {Card, CardActions, CardContent} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import React, {useState} from "react";
import {QuizCardProps} from "./Popup";
import {Pictures} from "./Pictures";
import {quizStyles} from "./QuizStyles";
import {usePipe, useSub} from "../../lib/UseObs";
import {Observable} from "rxjs";
import QuizStatsHeader from "./QuizStatsHeaders";

export function Characters({c, m}: QuizCardProps) {
    const classes = quizStyles();
    let advance = () => m.quizManager.quizzingComponent$.next("Pictures");
    return <Card className={classes.card}>
        <CardContent className={classes.cardContent}>
            <Typography variant="h1" component="h1" className={classes.center}>
                {c?.learningLanguage}
            </Typography>
        </CardContent>
        <CardActions className={classes.cardActions}>
            <QuizStatsHeader m={m}/>
            <Button onClick={advance}>Next</Button>
        </CardActions>
    </Card>
}