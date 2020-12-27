import React from "react";
import {Card, CardContent} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import {QuizCardProps} from "./Popup";
import {quizStyles} from "./QuizStyles";
import {HotkeyWrapper} from "../HotkeyWrapper";

export function Conclusion({c, m}: QuizCardProps) {
    const classes = quizStyles();

    return <Card className={classes.card}>
        <CardContent style={{height: '25vh', display: 'flex', flexFlow: "row nowrap", justifyContent: 'flex-end'}}>
            <div style={{height: '100%', display: 'flex', flexFlow: 'column nowrap', justifyContent: 'center'}}>
                <div style={{width: '25%', marginTop: '100px'}}>
                    <HotkeyWrapper action={"QUIZ_RESULT_HARD"}>
                        <Button onClick={() => m.hotkeyEvents.quizResultHard$.next()}>Hard</Button>
                    </HotkeyWrapper>
                    <HotkeyWrapper action={"QUIZ_RESULT_MEDIUM"}>
                        <Button onClick={() => m.hotkeyEvents.quizResultMedium$.next()}>Medium</Button>
                    </HotkeyWrapper>
                    <HotkeyWrapper action={"QUIZ_RESULT_EASY"}>
                        <Button onClick={() => m.hotkeyEvents.quizResultEasy$.next()}>Easy</Button>
                    </HotkeyWrapper>
                </div>
            </div>
        </CardContent>
    </Card>;
}