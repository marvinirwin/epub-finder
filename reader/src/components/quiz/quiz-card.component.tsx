import React, { Fragment, useContext } from 'react'
import { Paper } from '@material-ui/core'
import { useObservableState } from 'observable-hooks'
import { QuizCard } from './word-card.interface'
import { ManagerContext } from '../../App'
import { PaperProps } from '@material-ui/core/Paper/Paper'
import { CardImage } from './quiz-card-image.component'
import { CardInfo } from '../../lib/schedule/quiz-card-current-card-info.component'
import { QuizCardButtons } from './quiz-card-buttons.component'
import { useIsFieldHidden } from './useIsFieldHidden'
import { QuizCardLimitReached } from './empty-quiz-card.component'
import { CardLearningLanguageText } from '../word-information/word-information.component'
import { OpenDocumentComponent } from '../reading/open-document.component'
import { QuizCardField } from '../../lib/quiz/hidden-quiz-fields'
import { allScheduleRowsForWord } from '../../lib/manager/sorted-limit-schedule-rows.service'
import { useScheduleInfo } from './todays-quiz-stats.component'
import { QuizCardSound } from './quiz-card-sound.component'
import { NoScheduleRows } from './no-schedule-rows.component'
import { RevealedQuizCard } from './card-types/revealed-quiz-card.component'


export const useActiveFlashCardTypes = () => {
    const m = useContext(ManagerContext)
    return useObservableState(m.flashCardTypesRequiredToProgressService.activeFlashCardTypes$) || []
}

export const QuizCardComponent: React.FC<{ quizCard: QuizCard } & PaperProps> = ({ quizCard, ...props }) => {
    const m = useContext(ManagerContext)
    const scheduleInfo = useScheduleInfo()
    const cardLimit = useObservableState(m.settingsService.newQuizWordLimit$) || 0
    const limitedScheduleRowData = useObservableState(m.sortedLimitedQuizScheduleRowsService.sortedLimitedScheduleRows$)
    const flashCardTypes = useActiveFlashCardTypes()
    const wordsLearnedToday = Object.values(allScheduleRowsForWord(scheduleInfo.wordsLearnedToday, flashCardTypes))
    const cardLimitReached = wordsLearnedToday.length >= cardLimit
    const noScheduleRows = limitedScheduleRowData
        ?.limitedScheduleRows?.length === 0 && !cardLimitReached;
    const answerIsRevealed = useObservableState(quizCard.answerIsRevealed$);
    return (
        <Paper className='quiz-card' {...props}>
            {
                noScheduleRows && <NoScheduleRows />
            }
            {
                cardLimitReached && <QuizCardLimitReached />
            }
            {
                (!cardLimitReached && !noScheduleRows) && (
                    <Fragment>
                        {
                            answerIsRevealed ?
                                <RevealedQuizCard quizCard={quizCard}/> :
                                <UnAnsweredQuizCard quizCard={quizCard}/>;
                        }
                        <QuizCardButtons quizCard={quizCard} />
                    </Fragment>
                )
            }
        </Paper>
    )
}
