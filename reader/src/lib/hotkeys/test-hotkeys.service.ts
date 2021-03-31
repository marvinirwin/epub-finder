import { HotKeyEvents } from './HotKeyEvents'
import { PronunciationProgressRepository } from '../schedule/pronunciation-progress.repository'
import { LanguageConfigsService } from '../language/language-configs.service'
import { withLatestFrom } from 'rxjs/operators'

export class TestHotkeysService {
    constructor({
                    hotkeyEvents,
                    pronunciationProgressService,
                    languageConfigsService,
                }: {
        hotkeyEvents: HotKeyEvents
        pronunciationProgressService: PronunciationProgressRepository
        languageConfigsService: LanguageConfigsService
    }) {
        hotkeyEvents.subjects.PRONUNCIATION_RECORD_SUCCESS.pipe(
            withLatestFrom(languageConfigsService.languageCode$),
        ).subscribe(([_, languageCode]) => {
            pronunciationProgressService.addRecords$.next([
                {
                    word: '大小姐',
                    success: true,
                    timestamp: new Date(),
                    languageCode,
                },
            ])
        })
    }
}
