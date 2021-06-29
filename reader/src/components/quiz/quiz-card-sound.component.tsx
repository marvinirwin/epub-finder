import React, { useEffect, useState } from 'react'
import { QuizCard } from './word-card.interface'
import { useLoadingObservable } from '../../lib/util/create-loading-observable'
import { useIsFieldHidden } from './useIsFieldHidden'
import { QuizCardField } from '../../lib/quiz/hidden-quiz-fields'
import { useObservableState } from 'observable-hooks'

export const QuizCardSound: React.FC<{ quizCard: QuizCard }> = ({ quizCard }) => {
    const { value: audio, isLoading } = useLoadingObservable(quizCard.audio$)
    const isHidden = useIsFieldHidden({ quizCard, label: QuizCardField.Sound })
    const currentType = useObservableState(quizCard.flashCardType$)
    const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null)
    useEffect(() => {
        (async () => {
            try {
                if (audioRef && audio && !isLoading) {
                    audioRef.currentTime = 0
                    await audioRef.play()
                }
            } catch(e) {
                console.error(e);
            }
        })()
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