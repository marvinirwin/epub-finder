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
            withLatestFrom(languageConfigsService.readingLanguageCode$),
        ).subscribe(([_, language_code]) => {
            pronunciationProgressService.addRecords$.next([
                {
                    word: '大小姐',
                    success: true,
                    created_at: new Date(),
                    language_code,
                },
            ])
        })
    }
}
