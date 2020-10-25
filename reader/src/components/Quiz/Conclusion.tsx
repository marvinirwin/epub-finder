import React, {useEffect, useState, Fragment} from "react";
import {EditingCard} from "../../lib/ReactiveClasses/EditingCard";
import {Card, CardContent} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import {QuizCardProps} from "./Popup";
import {quizStyles} from "./QuizStyles";
import {RecognitionMap} from "../../lib/Scheduling/SRM";
import {HotkeyWrapper} from "../HotkeyWrapper";
import {useObservableState} from "observable-hooks";

export function Conclusion({c, m}: QuizCardProps) {
    const classes = quizStyles();
    const [editingCard, setEditingCard] = useState<EditingCard | null>(null);
    useEffect(() => {
        c && m.editingCardManager.requestEditWord$.next(c.learningLanguage)
        setEditingCard(c ? EditingCard.fromICard(
            c,
            m.cardDBManager,
            m.cardManager
        ) : null);
    }, [c, m]);
    const hotkeyMap = useObservableState(m.db.hotkeys$, {});

    return editingCard ? <Card className={classes.card}>
        <CardContent style={{height: '25vh', display: 'flex', flexFlow: "row nowrap", justifyContent: 'flex-end'}}>
            <div style={{height: '100%', display: 'flex', flexFlow: 'column nowrap', justifyContent: 'center'}}>
                <div style={{width: '25%', marginTop: '100px'}}>
                    {
                        c &&
                        <Fragment>
                            <HotkeyWrapper action={"QUIZ_RESULT_HARD"}>
                                <Button onClick={() => m.hotkeyEvents.quizResultHard$.next()}>Hard</Button>
                            </HotkeyWrapper>
                            <HotkeyWrapper action={"QUIZ_RESULT_MEDIUM"}>
                                <Button onClick={() => m.hotkeyEvents.quizResultMedium$.next()}>Medium</Button>
                            </HotkeyWrapper>
                            <HotkeyWrapper action={"QUIZ_RESULT_EASY"}>
                                <Button onClick={() => m.hotkeyEvents.quizResultEasy$.next()}>Easy</Button>
                            </HotkeyWrapper>
                        </Fragment>
                    }
                </div>

            </div>
        </CardContent>
    </Card> : <div/>;
}