import React, { Fragment, useContext, useEffect, useState } from 'react'
import { Paper, Typography } from '@material-ui/core'
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
import { QuizCardScheduleTable } from '../tables/quiz-card-due-date-schedule-table.component'
import { QuizCardTranslationAttemptSchedule } from '../tables/quiz-card-translation-attempt-table.component'
import { OpenDocumentComponent } from '../reading/open-document.component'
import { QuizCardField } from '../../lib/quiz/hidden-quiz-fields'
import { useLoadingObservable } from '../../lib/util/create-loading-observable'
import { outOfWords } from '@shared/'
import { allScheduleRowsForWord } from '../../lib/manager/sorted-limit-schedule-rows.service'
import { useScheduleInfo } from './todays-quiz-stats.component'

const QuizCardSound: React.FC<{ quizCard: QuizCard }> = ({ quizCard }) => {
    const { value: audio, isLoading } = useLoadingObservable(quizCard.audio$)
    const isHidden = useIsFieldHidden({ quizCard, label: QuizCardField.Sound })
    const currentType = useObservableState(quizCard.flashCardType$)
    const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null)
    useEffect(() => {
        if (audioRef && audio && !isLoading) {
            audioRef.currentTime = 0
            audioRef.play()
        }
    }, [currentType, audio])

    return (audio && !isHidden) ?
        <audio
            src={audio.url}
            autoPlay={!isLoading}
            controls
            ref={setAudioRef}
        /> :
        null
}

export const useActiveFlashCardTypes = () => {
    const m = useContext(ManagerContext)
    return useObservableState(m.flashCardTypesRequiredToProgressService.activeFlashCardTypes$) || []
}

export const QuizCardComponent: React.FC<{ quizCard: QuizCard } & PaperProps> = ({ quizCard, ...props }) => {
    const word = useObservableState(quizCard.word$)
    const m = useContext(ManagerContext)
    const isLearningLanguageHidden = useIsFieldHidden({
        quizCard,
        label: QuizCardField.LearningLanguage,
    })
    const scheduleInfo = useScheduleInfo()
    const cardLimit = useObservableState(m.settingsService.newQuizWordLimit$) || 0
    const limitedScheduleRowData = useObservableState(m.sortedLimitedQuizScheduleRowsService.sortedLimitedScheduleRows$)
    const flashCardTypes = useActiveFlashCardTypes();
    const wordsLearnedToday = Object.values(allScheduleRowsForWord(scheduleInfo.wordsLearnedToday, flashCardTypes));
    const cardLimitReached = wordsLearnedToday.length >= cardLimit
    const answerIsRevealed = useObservableState(quizCard.answerIsRevealed$)
    const exampleSegmentsHidden = useIsFieldHidden({ quizCard, label: QuizCardField.ExampleSegments })
    const noMoreWordsLeft = limitedScheduleRowData
        ?.limitedScheduleRows?.length === 0 && !cardLimitReached
    return (
        <Paper className='quiz-card' {...props}>
            {
                noMoreWordsLeft && <Typography
                    variant={'h3'}
                    className={outOfWords}
                >No more words left, try adding more learning material
                </Typography>
            }
            {
                cardLimitReached && <QuizCardLimitReached />
            }
            {
                (!cardLimitReached && !noMoreWordsLeft) && (
                    <Fragment>
                        <div className={'quiz-card-data-sheet'}>
                            <div>
{/*
                                <QuizCardTranslationAttemptSchedule />
*/}
                            </div>
                            <div className={'quiz-card-data-sheet-middle'}>
                                <CardImage quizCard={quizCard} />
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
                        {!exampleSegmentsHidden && <OpenDocumentComponent
                            style={{ alignSelf: 'start', margin: '24px', flex: 1, overflow: 'auto', width: '100%'}}
                            openedDocument={quizCard.exampleSentenceOpenDocument}
                        />}
                        <QuizCardButtons quizCard={quizCard} />
                    </Fragment>
                )
            }
        </Paper>
    )
}
