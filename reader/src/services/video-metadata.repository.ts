import { BehaviorSubject } from 'rxjs'
import axios from 'axios'
import { mapFromId } from '../lib/util/map.module'
import { VideoMetadata } from '@shared/'

export class VideoMetadataRepository {
    all$ = new BehaviorSubject<Map<string, VideoMetadata>>(new Map())

    constructor() {
        axios
            .get(`${process.env.PUBLIC_URL}/api/video_metadata`)
            .then((response) => {
                if (response.status === 200) {
                    const allMetadata = (response.data as unknown) as VideoMetadata[]
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
                        (v) => v.sentence,
                    )
                    this.all$.next(metadataMap)
                }
            })
    }
}
