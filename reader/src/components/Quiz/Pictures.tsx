import {Card, CardActions, CardContent, GridList, Typography} from "@material-ui/core";
import GridListTile from "@material-ui/core/GridListTile";
import Button from "@material-ui/core/Button";
import React from "react";
import {QuizCardProps} from "./Popup";
import {Conclusion} from "./Conclusion";
import {quizStyles} from "./QuizStyles";

export function CardPictureScreen({c, m}: QuizCardProps) {
    const classes = quizStyles();
    return <Card className={classes.card}>
        <CardContent className={classes.cardContent}>
            <GridList className={classes.center}>
                {c.photos.map((src: string, index: number) =>
                    <GridListTile key={src}>
                        <img src={src}/>
                    </GridListTile>
                )}
            </GridList>
            {!c.photos.length && <Typography variant="subtitle1">No pictures were provided for {c.learningLanguage}</Typography>}
        </CardContent>
        <CardActions className={classes.cardActions}>
            <Button onClick={() => m.quizManager.currentQuizDialogComponent$.next(Conclusion)}>Next</Button>
        </CardActions>
    </Card>;
}