import {BehaviorSubject, Observable, ReplaySubject} from "rxjs";
import {VideoMetadata} from "../components/pronunciation-video/video-meta-data.interface";
import axios from "axios";
import {mapFromId} from "../lib/map.module";
import CardsRepository from "../lib/manager/cards.repository";
import {isChineseCharacter} from "../../../server/src/shared/OldAnkiClasses/Card";

export class VideoMetadataRepository {
    all$ = new BehaviorSubject<Map<string, VideoMetadata>>(new Map())

    constructor({
                    cardsRepository
                }: {
                    cardsRepository: CardsRepository
                }
    ) {
        axios.get(`${process.env.PUBLIC_URL}/video_metadata`)
            .then(response => {
                if (response.status === 200) {
                    const allMetadata = response.data as unknown as VideoMetadata[];
                    // I'm totally going to regret this,
                    // I need to make a class VideoMetadata which removes its punctuation
/*
                    allMetadata
                        .forEach(metadata =>
                            metadata.sentence === metadata.sentence.split('')
                                .filter(s => isChineseCharacter(s))
                                .join('')
                        )
*/
                    const metadataMap = mapFromId(
                        allMetadata,
                        v => v.sentence
                    );
                    cardsRepository.putMouseoverDisabledWords([...metadataMap.keys()]);
                    this.all$.next(metadataMap)
                }
            });
    }
}