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
    currentLearningLanguage$: Observable<string | undefined>;
    answerIsShown$ = new BehaviorSubject<boolean>(false);
    currentScheduleRow$: Observable<ScheduleRow<TranslationAttemptScheduleData>>;
    currentRomanization$: Observable<string | undefined>;

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
            .pipe(
                map(indexedRows => Object.values(indexedRows)
                    .filter(r => r.dueDate() < new Date())[0]),
                shareReplay(1)
            );
        this.currentScheduleRow$.pipe(
            distinctUntilChanged()
        ).subscribe(() => this.answerIsShown$.next(false))
        this.currentLearningLanguage$ = this.currentScheduleRow$.pipe(
            map(row => row?.d.segmentText),
            distinctUntilChanged(),
            shareReplay(1)
        );
        this.currentTranslation$ = combineLatest([
            this.currentLearningLanguage$,
            languageConfigsService.learningToKnownTranslateFn$
        ]).pipe(
            switchMap(([currentTranslatableWord, learningToKnownTranslationFn]) => {
                return (learningToKnownTranslationFn && currentTranslatableWord) ?
                    learningToKnownTranslationFn(currentTranslatableWord)
                    : of(undefined)
            }),
            shareReplay(1)
        )
        this.currentRomanization$ = combineLatest([
            this.currentLearningLanguage$,
            languageConfigsService.learningToLatinTransliterateFn$
        ]).pipe(
            switchMap(([currentTranslatableWord, learningToLatinFn]) => {
                return (learningToLatinFn && currentTranslatableWord) ?
                    learningToLatinFn(currentTranslatableWord)
                    : of(undefined)
            }),
            shareReplay(1)
        )
    }
}