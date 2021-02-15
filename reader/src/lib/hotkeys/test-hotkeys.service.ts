import {HotkeysService} from "../../services/hotkeys.service";
import {HotKeyEvents} from "../HotKeyEvents";
import {PronunciationProgressRepository} from "../schedule/pronunciation-progress.repository";

export class TestHotkeysService {
    constructor({
                    hotkeyEvents,
        pronunciationProgressService
    }:{hotkeyEvents: HotKeyEvents, pronunciationProgressService: PronunciationProgressRepository}) {
        hotkeyEvents.subjects.PRONUNCIATION_RECORD_SUCCESS.subscribe(() => {
            pronunciationProgressService.addRecords$.next([{
                word: '大小姐',
                success: true,
                timestamp: new Date()
            }])
        })
    }
}