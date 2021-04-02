import { QuizCard } from './word-card.interface'
import { useObservableState } from 'observable-hooks'
import { FlashCardType, QuizCardField, resolveHiddenFieldsForFlashcardType } from '../../lib/quiz/hidden-quiz-fields'

export const useIsFieldHidden = ({
    quizCard,
    label,
}: {
    quizCard: QuizCard
    label: QuizCardField
}) => {
    const hiddenField = resolveHiddenFieldsForFlashcardType(useObservableState(quizCard.flashCardType$)  || FlashCardType.WordExamplesAndPicture)
    const answerIsRevealed = useObservableState(quizCard.answerIsRevealed$)
    return hiddenField.has(label) && !answerIsRevealed
}
