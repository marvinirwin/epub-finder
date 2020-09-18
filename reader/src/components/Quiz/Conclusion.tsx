import React, {useEffect, useState, Fragment} from "react";
import {EditingCard} from "../../lib/ReactiveClasses/EditingCard";
import {Card, CardContent} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import {QuizCardProps} from "./Popup";
import {quizStyles} from "./QuizStyles";
import {RecognitionMap} from "../../lib/Scheduling/SRM";
import {HotkeyWrapper} from "../HotkeyWrapper";

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
    }, [c, m])

    return editingCard ? <Card className={classes.card}>
        <CardContent style={{height: '25vh', display: 'flex', flexFlow: "row nowrap", justifyContent: 'flex-end'}}>
            <div style={{height: '100%', display: 'flex', flexFlow: 'column nowrap', justifyContent: 'center'}}>
                <div style={{width: '25%', marginTop: '100px'}}>
                    {
                        c &&
                        <Fragment>
                            <HotkeyWrapper shortcutKey={'1'}>
                                <Button onClick={() => m.quizManager.completeQuiz(c.learningLanguage, RecognitionMap.hard)}>Hard</Button>
                            </HotkeyWrapper>
                            <HotkeyWrapper shortcutKey={'2'}>
                                <Button onClick={() => m.quizManager.completeQuiz(c.learningLanguage, RecognitionMap.medium)}>Medium</Button>
                            </HotkeyWrapper>
                            <HotkeyWrapper shortcutKey={'3'}>
                                <Button onClick={() => m.quizManager.completeQuiz(c.learningLanguage, RecognitionMap.easy)}>Easy</Button>
                            </HotkeyWrapper>
                        </Fragment>
                    }
                </div>

            </div>
        </CardContent>
    </Card> : <div/>;
}