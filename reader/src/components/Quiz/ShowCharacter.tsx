import {Card, CardActions, CardContent} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import React from "react";
import {QuizCardProps} from "../QuizPopup";
import {CardPictureScreen} from "./ShowPictures";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
    root: {
        height: '100%',
        width: '100%',
        display: "flex",
        flexFlow: "column nowrap"
    },
    rootCenter: {
        flexGrow: 1,
        textAlign: 'center'
    },
    buttonBar: {
        display: "flex",
        justifyContent: "center"
    }
}));


export function ShowCharacter({c, m}: QuizCardProps) {
    const classes = useStyles();
    return <Card className={classes.root}>
        <CardContent style={{flexGrow: 1}}>
            <Typography variant="h1" component="h1" className={classes.rootCenter}>
                {c.learningLanguage}
            </Typography>
        </CardContent>
        <CardActions className={classes.buttonBar}>
            <Button onClick={() => m.quizManager.currentQuizDialogComponent$.next(CardPictureScreen)}>Next</Button>
        </CardActions>
    </Card>
}