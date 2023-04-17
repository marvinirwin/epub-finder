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
            settingsService.flashCardTypesRequiredToProgress$.obs$,
            settingsService.showSoundQuizCard$.obs$
        ]).pipe(
            map(([textToSpeechConfig, flashCardTypes, showSoundQuizCard]) => {
                const shouldRemovedSoundQuiz = !textToSpeechConfig || !showSoundQuizCard;
                if (shouldRemovedSoundQuiz) {
                        return flashCardTypes.filter(type => type !== FlashCardType.LearningLanguageAudio)
                    }
                    return flashCardTypes
                },
            ),
            shareReplay(1),
        )
    }
}