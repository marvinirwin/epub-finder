import {ReplaySubject} from "rxjs";
import {take} from "rxjs/operators";
import {cloneDeep} from "lodash";
import {PronunciationVideoService} from "../components/PronunciationVideo/pronunciation-video.service";
import {VideoMetadata} from "../types/index";
import axios from 'axios';
import {debounce} from 'lodash';
import {VideoMetadataDto} from '@server/';

export class EditingVideoMetadataService {
    private debounceSaveMetadata: (metadata:VideoMetadataDto) => void;
    private normaliseTimestamps(m: VideoMetadata): VideoMetadata {
        if (m.timeScale === 1) {
            return m;
        }
        const previousTimescale = m.timeScale;
        return {
            ...m,
            timeScale: 1,
            characters: m.characters.map(character =>
                // If the previous timescale was 0.5 then the normalized timestamp will be longer
                ({...character, timestamp: character.timestamp * previousTimescale}))
        }
    }

    public editingCharacterIndex$ = new ReplaySubject<number | undefined>(1);

    private pronunciationVideoService: PronunciationVideoService;

    constructor(
        {
            pronunciationVideoService
        }: {
            pronunciationVideoService: PronunciationVideoService
        }
    ) {
        this.pronunciationVideoService = pronunciationVideoService;
        this.debounceSaveMetadata = debounce(EditingVideoMetadataService.saveMetadata, 1000)
    }

    public async moveCharacter(metadata: VideoMetadata, index: number, duration: number) {
        const normalised = this.normaliseTimestamps(metadata);
        const videoCharacter = normalised.characters[index];
        videoCharacter.timestamp += (duration * normalised.timeScale) ;
        return normalised;
    }

    public async setCharacterTimestamp(metadata: VideoMetadata, index: number, timestamp: number) {
        const normalised = this.normaliseTimestamps(metadata);
        const videoCharacter = normalised.characters[index];
        videoCharacter.timestamp = timestamp * normalised.timeScale;
        this.debounceSaveMetadata({
            metadata: metadata,
        });
        return normalised;
    }

    private static async saveMetadata(metadata: VideoMetadataDto) {
        await axios.put(
            `${process.env.PUBLIC_URL}/video_metadata`,
            metadata
        );
    }
}