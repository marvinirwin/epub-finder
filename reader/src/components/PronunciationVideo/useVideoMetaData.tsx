import {VideoMetadataService} from "../../services/video-metadata.service";
import {useObservableState} from "observable-hooks";
import {of} from "rxjs";
import {VideoMetadata} from "../../types/";

export const useVideoMetaData = (sentence: string | undefined, videoMetadataService: VideoMetadataService): VideoMetadata | undefined => {
    return useObservableState(sentence && videoMetadataService.resolveMetadataListener$(sentence) || of());
}

