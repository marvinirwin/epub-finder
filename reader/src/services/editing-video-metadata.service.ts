import {ReplaySubject} from "rxjs";
import {VideoMetadata} from "../components/PronunciationVideo/video-meta-data.interface";
import {take} from "rxjs/operators";
import {cloneDeep} from "lodash";
import {PronunciationVideoService} from "../components/PronunciationVideo/pronunciation-video.service";

export class EditingVideoMetadataService {
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
    }

    public async moveCharacter(duration: number) {
        const editingMetadata = await this.pronunciationVideoService.videoMetaData$.pipe(take(1)).toPromise();
        const index = await this.editingCharacterIndex$.pipe(take(1)).toPromise();
        if (editingMetadata &&
            index !== undefined) {
            const clone = cloneDeep(this.normaliseTimestamps(editingMetadata));
            const videoCharacter = clone.characters[index];
            videoCharacter.timestamp += duration;
            this.pronunciationVideoService.videoMetaData$.next(clone)
            this.pronunciationVideoService.setVideoPlaybackTime$.next(videoCharacter.timestamp * clone.timeScale)
        }
    }
}