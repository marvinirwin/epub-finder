import React, {useContext, Fragment} from "react";
import {Paper, Typography} from "@material-ui/core";
import {useObservableState, useSubscription} from "observable-hooks";
import {OpenDocumentComponent} from "../../lib/atomized/open-document.component";
import {QuizCard} from "./word-card.interface";
import {ManagerContext} from "../../App";
import {PaperProps} from "@material-ui/core/Paper/Paper";
import {CardImage} from "./quiz-card-image.component";
import {observableLastValue} from "../../services/settings.service";
import {flatten, uniq} from "lodash";
import {CardInfo} from "../../lib/schedule/quiz-card-current-card-info.component";
import {QuizCardProgress} from "../../lib/schedule/quiz-card-progress.component";
import {quizCardLearningLanguage} from "@shared/";
import {QuizCardButtons} from "./quiz-card-buttons.component";
import {useIsFieldHidden} from "./useIsFieldHidden";
import {EmptyQuizCard} from "./empty-quiz-card.component";
import {CardLearningLanguageText} from "../word-paper.component";


export const QuizCardComponent: React.FC<{ quizCard: QuizCard } & PaperProps> = ({quizCard, ...props}) => {
    const word = useObservableState(quizCard.word$);
    const m = useContext(ManagerContext);
    const isLearningLanguageHidden = useIsFieldHidden({quizCard, label: 'learningLanguage'})
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
    return <Paper className='quiz-card' {...props}>
        {
            word ?
                <Fragment>
                    <div className={'quiz-card-data-sheet'}>
                        <div>
                            <QuizCardProgress quizCard={quizCard}/>
                        </div>
                        <div className={'quiz-card-data-sheet-middle'}>
                            <CardImage quizCard={quizCard}/>
                            {
                                !isLearningLanguageHidden && <CardLearningLanguageText word={word}/>
                            }
                        </div>
                        <div>
                            <CardInfo quizCard={quizCard}/>
                        </div>
                    </div>
                    <OpenDocumentComponent openedDocument={quizCard.exampleSentenceOpenDocument}/>
                    <QuizCardButtons quizCard={quizCard}/>
                </Fragment> :
                <EmptyQuizCard/>
        }


    </Paper>
}