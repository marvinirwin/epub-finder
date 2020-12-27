import React from "react";
import {Paper, Typography} from "@material-ui/core";
import {CardEntity} from "./card.entity";
import {CardImage} from "./card-image.component";
import {ExampleSentences} from "../example-sentences/example-sentences.component";
import {useObservableState} from "observable-hooks";

export const QuizCard = ({cardEntity}:{cardEntity: CardEntity}) => {
    const word = useObservableState(cardEntity.)
    return <Paper className='quiz-card'>
        <Typography> Card Text </Typography>
        <CardImage c={cardEntity}> </CardImage>
        <ExampleSentences sentences={exampleSentences$}/>
    </Paper>
}