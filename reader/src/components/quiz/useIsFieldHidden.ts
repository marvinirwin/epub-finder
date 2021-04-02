import { QuizCard } from './word-card.interface'
import { useObservableState } from 'observable-hooks'
import { QuizCardFields } from './quiz-card-fields.interface'

export const useIsFieldHidden = ({
    quizCard,
    label,
}: {
    quizCard: QuizCard
    label: keyof QuizCardFields
}) => {
    const flashCardTypes = useObservableState(quizCard.hiddenFields$) || new Set()
    const answerIsRevealed = useObservableState(quizCard.answerIsRevealed$)
    return flashCardTypes.has(label) && !answerIsRevealed
}
