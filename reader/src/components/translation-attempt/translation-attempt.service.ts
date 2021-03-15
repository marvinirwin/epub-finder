import {
    TranslationAttemptScheduleData,
    TranslationAttemptScheduleService
} from "../../lib/schedule/translation-attempt-schedule.service";
import {BehaviorSubject, combineLatest, Observable, of, ReplaySubject} from "rxjs";
import {distinctUntilChanged, map, shareReplay, switchMap} from "rxjs/operators";
import {LanguageConfigsService} from "../../lib/language-configs.service";
import {ScheduleRow} from "../../lib/schedule/schedule-row";

export class TranslationAttemptService {
    currentTranslation$: Observable<string | undefined>;
    currentKnownLanguage$: Observable<string | undefined>;
    answerIsShown$ = new BehaviorSubject<boolean>(false);
    currentScheduleRow$: Observable<ScheduleRow<TranslationAttemptScheduleData>>;

    constructor(
        {
            translationAttemptScheduleService,
            languageConfigsService
        }: {
            translationAttemptScheduleService: TranslationAttemptScheduleService,
            languageConfigsService: LanguageConfigsService
        }
    ) {
        this.currentScheduleRow$ = translationAttemptScheduleService.indexedScheduleRows$
            .pipe(map(rows => rows[0]));
        this.currentKnownLanguage$ = this.currentScheduleRow$.pipe(
            map(row => row?.d.segmentText),
            distinctUntilChanged(),
            shareReplay(1)
        );
        this.currentTranslation$ = combineLatest([
            this.currentKnownLanguage$,
            languageConfigsService.knownToLearningTranslate$
        ]).pipe(
            switchMap(([currentTranslatableWord, knownTolearningTranslateConfig]) => {
                return (knownTolearningTranslateConfig && currentTranslatableWord) ?
                    knownTolearningTranslateConfig(currentTranslatableWord)
                    : of(undefined)
            }),
            shareReplay(1)
        )
    }
}