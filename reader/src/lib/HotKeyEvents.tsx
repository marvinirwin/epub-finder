import {Manager} from "./Manager";
import {of, Subject} from "rxjs";
import { switchMap, withLatestFrom} from "rxjs/operators";
import {RecognitionMap} from "./Scheduling/SRM";

export interface Hotkeys<T> {
    OPEN_IMAGE_SEARCH: T,
    HIDE: T,
    MARK_AS_KNOWN: T,
    DELETE_CARD: T,
    QUIZ_RESULT_EASY: T,
    QUIZ_RESULT_MEDIUM: T,
    QUIZ_RESULT_HARD: T,
    RECORD_QUIZ_WORD: T,
    REQUEST_EDIT_WORD: T,
    ADVANCE_QUIZ: T,
    HIDE_VIDEO: T
}

export class HotKeyEvents {
    public openImageSearch$ = new Subject<void>();
    public hide$ = new Subject<void>();
    public markAsKnown$ = new Subject<void>();
    public deleteCard$ = new Subject<void>();
    public quizResultEasy$ = new Subject<void>();
    public quizResultMedium$ = new Subject<void>();
    public recordQuizWord$ = new Subject<void>();
    public quizResultHard$ = new Subject<void>();
    public requestEditQuizWord$ = new Subject<void>();
    public advanceQuiz$ = new Subject<void>();
    public hideVideo$ = new Subject<void>();

    constructor(public m: Manager) {
    }

    public startListeners() {
        const m = this.m;
        this.openImageSearch$.pipe(
            withLatestFrom(m.editingCardManager.editingCard$)
        ).subscribe(async ([_, editingCard]) => {
            if (!editingCard) {
                return;
            }
            const [
                characters,
                photos
            ] = await Promise.all([
                editingCard.learningLanguage$.toPromise(),
                editingCard.photos$.toPromise()
            ]);
            m.queryImageRequest$.next({
                term: characters,
                cb: (s: string) => editingCard.photos$.next(photos?.concat(s))
            })
        });


        this.requestEditQuizWord$
            .pipe(
                withLatestFrom(m.quizCharacterManager.quizzingCard$)
            ).subscribe(async ([_, card]) => {
            if (card) {
                m.editingCardManager.requestEditWord$.next(card.learningLanguage);
            }
        });

        this.advanceQuiz$.subscribe(() => {
            m.quizManager.advanceQuizStage$.next()
        });

        function setQuizResult(quizResultEasy$2: Subject<void>, recognitionScore1: number) {
            quizResultEasy$2.pipe(
                withLatestFrom(m.quizCharacterManager.quizzingCard$)
            ).subscribe(([_, card]) => {
                if (card) {
                    m.quizManager.completeQuiz(card.learningLanguage, recognitionScore1)
                }
            });
        }

        setQuizResult(this.quizResultEasy$, RecognitionMap.easy);
        setQuizResult(this.quizResultMedium$, RecognitionMap.medium);
        setQuizResult(this.quizResultHard$, RecognitionMap.hard);

        this.hide$.pipe(withLatestFrom(
            m.queryImageRequest$,
            m.editingCardManager.showEditingCardPopup$
        )).subscribe(([_, imageQuery, showEditingCard]) => {
            if (imageQuery) {
                m.editingCardManager.showEditingCardPopup$.next(false);
            } else if (showEditingCard) {
                m.queryImageRequest$.next(undefined);
            }
        });

        this.deleteCard$.pipe(
            withLatestFrom(m.editingCardManager.editingCard$.pipe(switchMap(e => {
                if (e) {
                    return e?.learningLanguage$;
                } else {
                    return of('')
                }
            })))
        ).subscribe(([_, learningLanguage]) => {
            if (learningLanguage) {
                m.cardManager.deleteWords.next([learningLanguage]);
                m.editingCardManager.queEditingCard$.next(undefined)
            }
        })
    }

    public hotkeyActions(): Hotkeys<Subject<void>> {
        return {
            OPEN_IMAGE_SEARCH: this.openImageSearch$,
            HIDE: this.hide$,
            MARK_AS_KNOWN: this.markAsKnown$,
            DELETE_CARD: this.deleteCard$,
            QUIZ_RESULT_EASY: this.quizResultEasy$,
            QUIZ_RESULT_MEDIUM: this.quizResultMedium$,
            QUIZ_RESULT_HARD: this.quizResultHard$,
            ADVANCE_QUIZ: this.advanceQuiz$,
            RECORD_QUIZ_WORD: this.recordQuizWord$,
            REQUEST_EDIT_WORD: this.requestEditQuizWord$,
            HIDE_VIDEO: this.hideVideo$
        }
    }
    public static defaultHotkeys(): Hotkeys<string[]> {
        return {
            OPEN_IMAGE_SEARCH: ['s'],
            HIDE: ['Escape'],
            MARK_AS_KNOWN: ['g'],
            DELETE_CARD: ['d'],
            QUIZ_RESULT_EASY: ['3'],
            QUIZ_RESULT_MEDIUM: ['2'],
            QUIZ_RESULT_HARD: ['1'],
            ADVANCE_QUIZ: ['Space'],
            RECORD_QUIZ_WORD: ['r'],
            REQUEST_EDIT_WORD: ['e'],
            HIDE_VIDEO: ['v']
        }
    }
}