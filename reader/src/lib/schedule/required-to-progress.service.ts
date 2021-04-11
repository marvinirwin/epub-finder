import { LanguageConfigsService } from '../language/language-configs.service'
import { SettingsService } from '../../services/settings.service'
import { combineLatest, Observable } from 'rxjs'
import { FlashCardType } from '../quiz/hidden-quiz-fields'
import { map, shareReplay } from 'rxjs/operators'

export class FlashCardTypesRequiredToProgressService {
    activeFlashCardTypes$: Observable<FlashCardType[]>

    constructor(
        {
            languageConfigsService,
            settingsService,
        }:
            {
                languageConfigsService: LanguageConfigsService,
                settingsService: SettingsService
            },
    ) {
        this.activeFlashCardTypes$ = combineLatest([
            languageConfigsService.learningLanguageTextToSpeechConfig$,
            settingsService.flashCardTypesRequiredToProgress$,
        ]).pipe(
            map(([textToSpeechConfig, flashCardTypes]) => {
                    if (!textToSpeechConfig) {
                        return flashCardTypes.filter(type => type !== FlashCardType.LearningLanguageAudio)
                    }
                    return flashCardTypes
                },
            ),
            shareReplay(1),
        )
    }
}