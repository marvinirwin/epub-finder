import { useContext } from 'react'
import { useSubscription } from 'observable-hooks'
import { ManagerContext } from '../../App'
import { VideoMetadata } from '@shared/'

export function useApplyTimeBySelectedCharacter(
    videoElementRef: HTMLVideoElement | null | undefined,
    currentSentence: string | undefined,
    videoMetaData: VideoMetadata | undefined,
) {
    const m = useContext(ManagerContext)
    useSubscription(m.browserInputsService.videoCharacterIndex$, (index) => {
        if (
            videoElementRef &&
            currentSentence &&
            (index === 0 || index) &&
            videoMetaData
        ) {
            const time = videoMetaData?.characters?.[index]?.timestamp
            const timeScale = videoMetaData?.timeScale
            if (time && timeScale) {
                videoElementRef.currentTime = (time * timeScale) / 1000
            }
        }
    })
}
