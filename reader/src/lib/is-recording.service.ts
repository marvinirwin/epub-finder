import {SettingsService} from "../services/settings.service";
import {AudioManager} from "./manager/AudioManager";
import {combineLatest, Observable} from "rxjs";
import {map, shareReplay} from "rxjs/operators";

export class IsRecordingService {
    private isRecording: Observable<boolean>;
    constructor(
        {
            settingsService,
            audioRecordingService
        }:
            {
                settingsService: SettingsService,
                audioRecordingService: AudioManager
            }
    ) {
        this.isRecording = combineLatest([
            settingsService.manualIsRecording$,
            audioRecordingService.audioRecorder.isRecording$
        ]).pipe(
            map(values => !!values.find(v => v)),
            shareReplay(1)
        )
    }
}