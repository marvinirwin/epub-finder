import {Card, CardActions, CardContent, GridList} from "@material-ui/core";
import GridListTile from "@material-ui/core/GridListTile";
import Button from "@material-ui/core/Button";
import React from "react";
import {QuizCardProps} from "../QuizPopup";
import {EditCardScreen} from "./EditCardScreen";

export function CardPictureScreen({c, m}: QuizCardProps) {
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
            <Button onClick={() => m.quizManager.currentQuizDialogComponent$.next(EditCardScreen)}>Next</Button>
        </CardActions>
    </Card>;
}