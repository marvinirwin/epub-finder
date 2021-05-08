import {
    TranslationAttemptScheduleData,
    TranslationAttemptScheduleService,
} from '../../lib/schedule/translation-attempt-schedule.service'
import {
    BehaviorSubject,
    combineLatest,
    Observable,
    of,
    ReplaySubject,
} from 'rxjs'
import {
    distinctUntilChanged,
    map,
    shareReplay,
    switchMap,
} from 'rxjs/operators'
import { LanguageConfigsService } from '../../lib/language/language-configs.service'
import { ScheduleRow } from '../../lib/schedule/schedule-row'
import { fetchTranslation } from '../../services/translate.service'
import { fetchTransliteration } from '../../lib/language/transliterate.service'

export class TranslationAttemptService {
    currentTranslation$: Observable<string | undefined>
    currentLearningLanguage$: Observable<string | undefined>
    answerIsShown$ = new BehaviorSubject<boolean>(false)
    currentScheduleRow$: Observable<ScheduleRow<TranslationAttemptScheduleData>>
    currentRomanization$: Observable<string | undefined>

    constructor({
        translationAttemptScheduleService,
        languageConfigsService,
    }: {
        translationAttemptScheduleService: TranslationAttemptScheduleService
        languageConfigsService: LanguageConfigsService
    }) {
        this.currentScheduleRow$ = translationAttemptScheduleService.scheduleRows$.pipe(
            map(
                (indexedRows) =>
                    Object.values(indexedRows).filter(
                        (r) => +r.dueDate() < Date.now(),
                    )[0],
            ),
            shareReplay(1),
        )
        this.currentScheduleRow$
            .pipe(distinctUntilChanged())
            .subscribe(() => this.answerIsShown$.next(false))
        this.currentLearningLanguage$ = this.currentScheduleRow$.pipe(
            map((row) => row?.d.segmentText),
            distinctUntilChanged(),
            shareReplay(1),
        )
        this.currentTranslation$ = combineLatest([
            this.currentLearningLanguage$,
            languageConfigsService.learningToKnownTranslateConfig$,
        ]).pipe(
            switchMap(
                ([
                    currentTranslatableWord,
                    learningToKnownTranslationConfig,
                ]) => {
                    return learningToKnownTranslationConfig &&
                        currentTranslatableWord
                        ? fetchTranslation({
                              ...learningToKnownTranslationConfig,
                              text: currentTranslatableWord,
                          })
                        : of(undefined)
                },
            ),
            shareReplay(1),
        )
        this.currentRomanization$ = combineLatest([
            this.currentLearningLanguage$,
            languageConfigsService.learningToLatinTransliterateFn$,
        ]).pipe(
            switchMap(([currentTranslatableWord, learningToLatinConfig]) => {
                return learningToLatinConfig && currentTranslatableWord
                    ? fetchTransliteration({
                          ...learningToLatinConfig,
                          text: currentTranslatableWord,
                      })
                    : of(undefined)
            }),
            shareReplay(1),
        )
    }
}
