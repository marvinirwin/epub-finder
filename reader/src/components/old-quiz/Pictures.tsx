import {Card, CardActions, CardContent, GridList, Paper, Typography} from "@material-ui/core";
import GridListTile from "@material-ui/core/GridListTile";
import Button from "@material-ui/core/Button";
import React from "react";
import {QuizCardProps} from "./Popup";
import {Conclusion} from "./Conclusion";
import {quizStyles} from "./QuizStyles";

export function Pictures({c, m}: QuizCardProps) {
    const classes = quizStyles();
    return <Paper className={classes.card}>
{/*
        <CardContent className={classes.cardContent}>
            {c?.photos.length &&
            <GridList className={classes.center}>
                {c?.photos.map((src: string) =>
                    <GridListTile key={src}>
                        <img src={src}/>
                    </GridListTile>
                )}
            </GridList>
            }
            {!c?.photos.length &&
            <Typography variant="subtitle1">No pictures were provided for {c?.learningLanguage}</Typography>}
        </CardContent>
*/}
    </Paper>;
}