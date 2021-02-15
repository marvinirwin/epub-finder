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

const QUIZ_BUTTON_HARD = 'quiz-button-hard';
const QUIZ_BUTTON_EASY = 'quiz-button-easy';
const QUIZ_BUTTON_IGNORE = 'quiz-button-hide';

export const QuizCardComponent: React.FC<{ quizCard: QuizCard } & PaperProps> = ({quizCard, ...props}) => {
    const word = useObservableState(quizCard.word$);
    const m = useContext(ManagerContext);
    const QUIZ_BUTTON_MEDIUM = 'quiz-button-medium';
    useSubscription(
        m.audioManager.audioRecorder.currentRecognizedText$,
        async recognizedText => {
            if (!word) {
                return;
            }
            const exampleSegments = await observableLastValue(m.exampleSentencesService.exampleSegmentMap$);
            const pronouncedQuizWord = recognizedText.includes(word);
            const pronouncedTextIsInExampleSegments = uniq(
                flatten(Array.from(exampleSegments.values()))).map(segment => segment.translatableText)
                .find(segmentText => segmentText.includes(recognizedText))
            if (pronouncedQuizWord && pronouncedTextIsInExampleSegments) {
                m.hotkeyEvents.quizResultEasy$.next()
            }
        })
    return <Paper className='quiz-card' {...props}>
        <div className={'quiz-card-data-sheet'}>
            <div>
                <QuizCardProgress quizCard={quizCard}/>
            </div>
            <div className={'quiz-card-data-sheet-middle'}>
                <QuizCardImage quizCard={quizCard}/>
                <Typography variant={'h1'} className={'quiz-text'}>{word || ''}</Typography>
            </div>
            <div>
                <QuizCardCurrentCardInfo quizCard={quizCard}/>
            </div>
        </div>
        <OpenDocumentComponent openedDocument={quizCard.exampleSentenceOpenDocument}/>
        <div className={'quiz-button-row'}>
            <Button
                className={QUIZ_BUTTON_HARD}
                onClick={() => m.hotkeyEvents.quizResultHard$.next()}>
                Hard
            </Button>
            <Button
                className={QUIZ_BUTTON_MEDIUM}
                onClick={() => m.hotkeyEvents.quizResultMedium$.next()}>
                Medium
            </Button>
            <Button
                className={QUIZ_BUTTON_EASY}
                onClick={() => m.hotkeyEvents.quizResultEasy$.next()}
            >
                Easy
            </Button>
            <Button
                className={QUIZ_BUTTON_IGNORE}
                onClick={() => {
                    if (word) {
                        m.ignoredWordsRepository.addRecords$.next([{word, timestamp: new Date()}])
                    }
                }}>
                Ignore
            </Button>
        </div>
    </Paper>
}