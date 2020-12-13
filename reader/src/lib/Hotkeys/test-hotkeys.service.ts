import {HotkeysService} from "../../services/hotkeys.service";
import {HotKeyEvents} from "../HotKeyEvents";
import {PronunciationProgressService} from "../schedule/pronunciation-progress.service";

export class TestHotkeysService {
    constructor({
                    hotkeyEvents,
        pronunciationProgressService
    }:{hotkeyEvents: HotKeyEvents, pronunciationProgressService: PronunciationProgressService}) {
        hotkeyEvents.subjects.PRONUNCIATION_RECORD_SUCCESS.subscribe(() => {
            pronunciationProgressService.addRecords$.next([{
                word: '大小姐',
                success: true,
            }])
        })
    }
}