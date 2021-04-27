import { QuizCard } from '../word-card.interface'
import { useObservableState } from 'observable-hooks'
import { FlashCardType } from '../../../lib/quiz/hidden-quiz-fields'
import { KnownLanguageCard } from './known-language-card.component'
import { LearningLanguageCard } from './learning-language-card.component'
import { LearningLanguageSound } from './learning-language-sound.component'
import React from 'react'

export const UnRevealedQuizCardComponent: React.FC<{ quizCard: QuizCard}> = ({quizCard }) => {
    const cardType = useObservableState(quizCard.flashCardType$);
    const m: {[key: string]: React.FC<{quizCard: QuizCard}>} = {
        [FlashCardType.WordExamplesAndPicture]: LearningLanguageCard,
        [FlashCardType.KnownLanguage]: KnownLanguageCard,
        [FlashCardType.LearningLanguageAudio]: LearningLanguageSound,
    }
    const Component = m[cardType || ''];
    if (Component) {
        return <Component quizCard={quizCard}/>
    }
    return <div/>;
}