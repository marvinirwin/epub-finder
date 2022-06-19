import { useObservableState } from 'observable-hooks'
import { ManagerContext } from '../../App'
import { useContext } from 'react'
import { VideoMetadata } from '@shared/'

export const useVideoMetaData = (
    sentence: string | undefined,
): VideoMetadata | undefined => {
    const m = useContext(ManagerContext)
    const b = useObservableState(m.videoMetadataRepository.all$)
    return b?.get(sentence || '')
    /*
    return useObservableState(sentence && videoMetadataService.resolveMetadataListener$(sentence) || of());
*/
}
