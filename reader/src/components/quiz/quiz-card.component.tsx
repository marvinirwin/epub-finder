import React, {useContext} from "react";
import {Button, Paper, Typography} from "@material-ui/core";
import {useObservableState, useSubscription} from "observable-hooks";
import {OpenDocumentComponent} from "../../lib/atomized/open-document.component";
import {QuizCard} from "./quiz-card.interface";
import {ManagerContext} from "../../App";
import {PaperProps} from "@material-ui/core/Paper/Paper";
import {QuizCardImage} from "./quiz-card-image.component";
import {observableLastValue} from "../../services/settings.service";
import {uniq, flatten} from "lodash";
import {QuizCardCurrentCardInfo} from "../../lib/schedule/quiz-card-current-card-info.component";
import {QuizCardProgress} from "../../lib/schedule/quiz-card-progress.component";
import {QUIZ_BUTTON_EASY, QUIZ_BUTTON_HARD, QUIZ_BUTTON_IGNORE, QUIZ_BUTTON_MEDIUM} from "@shared/";


export const QuizCardComponent: React.FC<{ quizCard: QuizCard } & PaperProps> = ({quizCard, ...props}) => {
    const word = useObservableState(quizCard.word$);
    const m = useContext(ManagerContext);
    useSubscription(
        m.audioRecordingService.audioRecorder.currentRecognizedText$,
        async recognizedText => {
            if (!word) {
                return;
            }
            const exampleSegments = await observableLastValue(m.exampleSentencesService.exampleSegmentMap$);
            const pronouncedQuizWord = recognizedText.includes(word);
            const pronouncedTextIsInExampleSegments = uniq(
                flatten(Array.from(exampleSegments.values()).map(set => Array.from(set.values())))
            ).map(segment => segment)
                .find(segmentText => segmentText.includes(recognizedText))
            if (pronouncedQuizWord && pronouncedTextIsInExampleSegments) {
                m.hotkeyEvents.quizResultEasy$.next()
            }
        })
    const hiddenFields = useObservableState(quizCard.hiddenFields$) || new Set();
    return <Paper className='quiz-card' {...props}>
        <div className={'quiz-card-data-sheet'}>
            <div>
                <QuizCardProgress quizCard={quizCard}/>
            </div>
            <div className={'quiz-card-data-sheet-middle'}>
                <QuizCardImage quizCard={quizCard}/>
                {!hiddenFields.has('learningLanguage') && <Typography variant={'h1'} className={'quiz-text'}>{word || ''}</Typography>}
            </div>
            <div>
                <QuizCardCurrentCardInfo quizCard={quizCard}/>
            </div>
        </div>
        <OpenDocumentComponent openedDocument={quizCard.exampleSentenceOpenDocument}/>
    </Paper>
}