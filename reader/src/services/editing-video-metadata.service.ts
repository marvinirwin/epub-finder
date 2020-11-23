import {ReplaySubject} from "rxjs";
import {VideoMetadata} from "../components/PronunciationVideo/video-meta-data.interface";
import {take} from "rxjs/operators";
import {cloneDeep} from "lodash";

export class EditingVideoMetadataService {
    editingCharacterIndex$ = new ReplaySubject<number | undefined>(1);
    private editingVideoMetadata$: ReplaySubject<VideoMetadata | undefined>;

    constructor(
        {
            editingVideoMetadata$
        }: {
            editingVideoMetadata$: ReplaySubject<VideoMetadata | undefined>
        }
    ) {
        this.editingVideoMetadata$ = editingVideoMetadata$;
    }

    public async moveCharacter(duration: number) {
        const editingMetadata = await this.editingVideoMetadata$.pipe(take(1)).toPromise();
        const index = await this.editingCharacterIndex$.pipe(take(1)).toPromise();
        if (editingMetadata &&
            index !== undefined) {
            const clone = cloneDeep(editingMetadata);
            clone.characters[index].timestamp += duration;
            this.editingVideoMetadata$.next(
                clone
            )
        }
    }
}