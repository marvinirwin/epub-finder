import { CardImage } from '../quiz-card-image.component'
import { QuizCardSound } from '../quiz-card-sound.component'
import { CardLearningLanguageText } from '../../word-information/word-information.component'
import { CardInfo } from '../../../lib/schedule/quiz-card-current-card-info.component'
import { OpenDocumentComponent } from '../../reading/open-document.component'
import React, { Fragment } from 'react'
import { QuizCard } from '../word-card.interface'
import { useObservableState } from 'observable-hooks'
import { useIsFieldHidden } from '../useIsFieldHidden'
import { QuizCardField } from '../../../lib/quiz/hidden-quiz-fields'

export const RevealedQuizCard = ({ quizCard }: { quizCard: QuizCard }) => {
    const answerIsRevealed = useObservableState(quizCard.answerIsRevealed$)
    const word = useObservableState(quizCard.word$)
    const exampleSegmentsHidden = useIsFieldHidden({ quizCard, label: QuizCardField.ExampleSegments })
    const isLearningLanguageHidden = useIsFieldHidden({
        quizCard,
        label: QuizCardField.LearningLanguage,
    })
    return <Fragment>
        <div className={'quiz-card-data-sheet'}>
            <div>
            </div>
            <div className={'quiz-card-data-sheet-middle'}>
                <CardImage wordInfo={quizCard} />
                <QuizCardSound quizCard={quizCard} />
                {!isLearningLanguageHidden && (
                    <CardLearningLanguageText word={word || ''} />
                )}
            </div>
            <div>
                {/*
                                {answerIsRevealed && <QuizCardScheduleTable />}
*/}
                {<CardInfo quizCard={quizCard} />}
            </div>
        </div>
        {
            !exampleSegmentsHidden && <OpenDocumentComponent
                style={{ alignSelf: 'start', margin: '24px', flex: 1, overflow: 'auto', width: '100%' }}
                openedDocument={quizCard.exampleSentenceOpenDocument}
            />
        }</Fragment>
}