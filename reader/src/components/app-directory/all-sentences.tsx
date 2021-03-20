import React from "react";
import {Manager} from "../../lib/Manager";
import {useObservableState} from "observable-hooks";
import {Observable} from "rxjs";
import {VideoMetadata} from "../pronunciation-video/video-meta-data.interface";

export const AllSentences: React.FC<{ m: Manager }> = ({m}) => {
    const allSentences /*useObservableState(m.videoMetadataService.allSentenceMetadata$, []);*/ = [];

    return <div className={'all-sentences'}>
{/*
        {allSentences.map(sentenceMetadata => <Sentence key={sentenceMetadata.sentence}
                                                        sentenceMetadata$={sentenceMetadata.metadata$}
                                                        sentence={sentenceMetadata.sentence}/>)}
*/}
    </div>
}
export const Sentence: React.FC<{ sentenceMetadata$: Observable<VideoMetadata>, sentence: string }> = ({
                                                                                                           sentence,
                                                                                                           sentenceMetadata$
                                                                                                       }) => {
    const metadata = useObservableState(sentenceMetadata$);
    return <div style={{backgroundColor: metadata ? 'white' : 'pink'}}>
        {sentence}
    </div>
}