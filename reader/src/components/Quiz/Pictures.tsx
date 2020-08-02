import {Card, CardActions, CardContent, GridList, Typography} from "@material-ui/core";
import GridListTile from "@material-ui/core/GridListTile";
import Button from "@material-ui/core/Button";
import React from "react";
import {QuizCardProps} from "./Popup";
import {Conclusion} from "./Conclusion";
import {quizStyles} from "./QuizStyles";
import {useSub} from "../../lib/UseObs";
import {Observable} from "rxjs";

export function Pictures({c, m}: QuizCardProps) {
    const classes = quizStyles();
    const advance = () => m.quizManager.currentQuizDialogComponent$.next(Conclusion);
    useSub(m.inputManager.getKeyDownSubject("Space"), (o$: Observable<any>) => o$.subscribe(advance));
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
            <Button onClick={advance}>Next</Button>
        </CardActions>
    </Card>;
}