import {Observable, ReplaySubject} from "rxjs";
import {VideoMetadata} from "../components/PronunciationVideo/video-meta-data.interface";
import axios from "axios";
import {mapFromId} from "../lib/map.module";
import CardsRepository from "../lib/Manager/cards.repository";

export class VideoMetadataRepository {
    all$ = new ReplaySubject<Map<string, VideoMetadata>>(1)

    constructor({
                    cardsRepository
                }: {
                    cardsRepository: CardsRepository
                }
    ) {
        axios.get(`${process.env.PUBLIC_URL}/video_metadata`)
            .then(response => {
                if (response.status === 200) {
                    const metadataMap = mapFromId(response.data as unknown as VideoMetadata[], v => v.sentence);
                    cardsRepository.putMouseoverDisabledWords([...metadataMap.keys()]);
                    this.all$.next(metadataMap)
                }
            });
    }
}