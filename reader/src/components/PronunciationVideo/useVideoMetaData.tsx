import {useEffect, useState} from "react";
import {VideoMetaData} from "./video-meta-data.interface";
import {fetchVideoMetadata} from "../../services/video.service";

export const useVideoMetaData = (sentence: string | undefined): VideoMetaData | undefined => {
    const [videoMetaData, setVideoMetaData] = useState<VideoMetaData | undefined>();
    useEffect(() => {
        (async () => {
            if (sentence) {
                setVideoMetaData(undefined);
                setVideoMetaData(await fetchVideoMetadata(sentence));
            }
        })()
    }, [sentence]);
    return videoMetaData;
}

