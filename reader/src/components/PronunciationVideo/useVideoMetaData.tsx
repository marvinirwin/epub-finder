import {useObservableState} from "observable-hooks";
import {of} from "rxjs";
import {VideoMetadata} from "../../types/";
import {ManagerContext} from "../../App";
import {useContext} from "react";

export const useVideoMetaData = (sentence: string | undefined): VideoMetadata | undefined => {
    const m = useContext(ManagerContext);
    const b = useObservableState(m.videoMetadataRepository.all$);
    return b?.get(sentence || '')
/*
    return useObservableState(sentence && videoMetadataService.resolveMetadataListener$(sentence) || of());
*/
}

