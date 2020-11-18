import {VideoMetadata} from "./video-meta-data.interface";
import {VideoMetadataService} from "../../services/video-metadata.service";
import {useObservableState} from "observable-hooks";
import {of} from "rxjs";

export const useVideoMetaData = (sentence: string | undefined, videoMetadataService: VideoMetadataService): VideoMetadata | undefined => {
    const allMetadata = useObservableState(videoMetadataService.sentenceMetadata$, {});
    return useObservableState(sentence && allMetadata[sentence]?.metadata$ || of());
}

