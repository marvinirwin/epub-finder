import {CardImage} from '../quiz-card-image.component'
import {QuizCardSound} from '../quiz-card-sound.component'
import {CardInfo} from '../../../lib/schedule/quiz-card-current-card-info.component'
import {OpenDocumentComponent} from '../../reading/open-document.component'
import React, {Fragment, useContext} from 'react'
import {QuizCard} from '../word-card.interface'
import {useObservableState} from 'observable-hooks'
import {useIsFieldHidden} from '../useIsFieldHidden'
import {QuizCardField} from '../../../lib/quiz/hidden-quiz-fields'
import {CardLearningLanguageText} from '../../word-information/card-learning-language.component'
import {CardOrderMetadata} from "./card-order-metadata.component";
import {ScheduleRowsTables} from "../../word-information/schedule-rows-tables.component";
import {ExpandOnClick} from "../../app-container/expandable-container";
import { ManagerContext } from '../../../App'
import { useVisibleObservableState } from '../../UseVisilbleObservableState/UseVisibleObservableState'
import { SegmentSubsequences } from "@shared/*";

export const RevealedQuizCard = ({quizCard}: { quizCard: QuizCard }) => {
    const word = useObservableState(quizCard.word$)
    const exampleSegmentsHidden = useIsFieldHidden({quizCard, label: QuizCardField.ExampleSegments})
    const {exampleSegmentsService} = useContext(ManagerContext);
    const emittedValues = useVisibleObservableState(exampleSegmentsService.exampleSegmentMap$, (v:Map<string, SegmentSubsequences[]>)  => `${Array.from(v.keys()).slice(0, 3).join(', ')} ${Array.from(v.keys()).length}`);
    return <Fragment>
        <div className={'quiz-card-data-sheet'}>
            <div>
                <CardImage wordInfo={quizCard}/>
                {/*
                <Typography variant={'subtitle2'}>Card Type: {quizCardType || ''}</Typography>
*/}
            </div>
            <div className={'quiz-card-data-sheet-middle'}>
                <QuizCardSound quizCard={quizCard}/>
                <CardLearningLanguageText word={word || ''}/>
            </div>
            <div className={`revealed-quiz-card-info-tab`}>
                {/*
                                {answerIsRevealed && <QuizCardScheduleTable />}
*/}
                {<CardInfo quizCard={quizCard}/>}
            </div>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-around', width: '100%'}}>
            <ExpandOnClick label={"Quiz Ordering"}>
                <CardOrderMetadata quizCard={quizCard}/></ExpandOnClick>
            <ScheduleRowsTables word={word || ''}/>
        </div>
        {
            !exampleSegmentsHidden && <OpenDocumentComponent
                style={{margin: '24px', flex: 1, overflow: 'auto', width: '100%'}}
                openedDocument={quizCard.exampleSentenceOpenDocument}
            />
        }</Fragment>
}