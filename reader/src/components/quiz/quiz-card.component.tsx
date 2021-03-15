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
import {QuizCardButtons} from "./quiz-card-buttons.component";
import {useIsFieldHidden} from "./useIsFieldHidden";
import {QuizCardLimitReached} from "./empty-quiz-card.component";
import {CardLearningLanguageText} from "../word-paper.component";
import {Observable, Subject} from "rxjs";
import {SuperMemoGrade} from "supermemo";


export const QuizCardComponent: React.FC<{ quizCard: QuizCard } & PaperProps> = ({quizCard, ...props}) => {
    const word = useObservableState(quizCard.word$);
    const m = useContext(ManagerContext);
    const isLearningLanguageHidden = useIsFieldHidden({quizCard, label: 'learningLanguage'})
    useSubscription(
        m.audioRecordingService.audioRecorder.currentRecognizedText$,
        async recognizedText => { });

    const useQuizResult = (obs$: Observable<unknown>, score: SuperMemoGrade) => {
        useSubscription(obs$, () => {
            if (word) {
                m.quizManager.completeQuiz(word, score)
            }
        })
    }
    useQuizResult(m.hotkeyEvents.quizResultEasy$, 5)
    useQuizResult(m.hotkeyEvents.quizResultMedium$, 3)
    useQuizResult(m.hotkeyEvents.quizResultHard$, 1)
    useSubscription(m.hotkeyEvents.quizResultIgnore$, () => {
        if (word) {
            m.ignoredWordsRepository
                .addRecords$.next([{word, timestamp: new Date()}])
        }
    })
    const cardsLearnedToday = useObservableState(m.quizCardScheduleService.cardsLearnedToday$)?.length || 0;
    const cardLimit = useObservableState(m.settingsService.newQuizWordLimit$) || 0;
    const cardLimitReached = cardsLearnedToday >= cardLimit;
    return <Paper className='quiz-card' {...props}>
        {
            !cardLimitReached ?
                <Fragment>
                    <div className={'quiz-card-data-sheet'}>
                        <div>
                            <QuizCardProgress quizCard={quizCard}/>
                        </div>
                        <div className={'quiz-card-data-sheet-middle'}>
                            <CardImage quizCard={quizCard}/>
                            {
                                !isLearningLanguageHidden && <CardLearningLanguageText word={word || ''}/>
                            }
                        </div>
                        <div>
                            <CardInfo quizCard={quizCard}/>
                        </div>
                    </div>
                    <OpenDocumentComponent openedDocument={quizCard.exampleSentenceOpenDocument}/>
                    <QuizCardButtons quizCard={quizCard}/>
                </Fragment> :
                <QuizCardLimitReached/>
        }


    </Paper>
}