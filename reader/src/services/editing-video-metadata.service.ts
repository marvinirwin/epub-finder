import { ReplaySubject } from 'rxjs'
import { orderBy } from 'lodash'
import { PronunciationVideoService } from '../components/pronunciation-video/pronunciation-video.service'
import axios from 'axios'
import { debounce } from 'lodash'
import { VideoMetadataDto } from '@shared/'
import { VideoMetadata } from '@shared/'
import { getApiUrl } from '../lib/util/getApiUrl'

export class EditingVideoMetadataService {
    public editingCharacterIndex$ = new ReplaySubject<number | undefined>(1)

    private debounceSaveMetadata: (metadata: VideoMetadataDto) => void

    private normaliseTimestamps(m: VideoMetadata): VideoMetadata {
        const previousTimescale = m.timeScale
        return {
            ...m,
            timeScale: 1,
            characters: m.characters.map((character) =>
                // If the previous timescale was 0.5 then the normalized timestamp will be longer
                ({
                    ...character,
                    timestamp: character.timestamp * previousTimescale,
                }),
            ),
        }
    }

    private pronunciationVideoService: PronunciationVideoService

    constructor({
        pronunciationVideoService,
    }: {
        pronunciationVideoService: PronunciationVideoService
    }) {
        this.pronunciationVideoService = pronunciationVideoService
        this.debounceSaveMetadata = debounce(
            EditingVideoMetadataService.saveMetadata,
            1000,
        )
    }

    public async setCharacterTimestamp(
        metadata: VideoMetadata,
        index: number,
        timestamp: number,
    ) {
        const normalised = this.normaliseTimestamps(metadata)
        const videoCharacter = normalised.characters[index]
        videoCharacter.timestamp = timestamp * normalised.timeScale
        normalised.characters = orderBy(normalised.characters, 'timestamp')
        this.debounceSaveMetadata({
            metadata: normalised,
        })
        return normalised
    }

    private static async saveMetadata(metadata: VideoMetadataDto) {
        await axios.put(getApiUrl("/api/video_metadata"), metadata)
    }
}
