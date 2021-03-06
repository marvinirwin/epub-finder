import {Manager} from "./Manager";
import {of, Subject} from "rxjs";
import {switchMap, withLatestFrom} from "rxjs/operators";
import {RecognitionMap} from "./srm/srm.service";
import {Hotkeys} from "./hotkeys/hotkeys.interface";
import {SuperMemoGrade} from "supermemo";

export class HotKeyEvents {

    public get openImageSearch$() {
        return this.subjects.OPEN_IMAGE_SEARCH;
    }
    public get hide$() {
        return this.subjects.HIDE;
    }
    public get deleteCard$() {
        return this.subjects.DELETE_CARD;
    }

    public get quizResultEasy$() {
        return this.subjects.QUIZ_RESULT_EASY;
    }
    public get quizResultMedium$() {
        return this.subjects.QUIZ_RESULT_MEDIUM;
    }
    public get recordQuizword$() {
        return this.subjects.RECORD_QUIZ_WORD;
    }
    public get quizResultHard$() {
        return this.subjects.QUIZ_RESULT_HARD;
    }
    public get requestEditQuizWord$() {
        return this.subjects.REQUEST_EDIT_WORD;
    }
    public get advanceQuiz$() {
        return this.subjects.ADVANCE_QUIZ;
    }
    public get hideVideo$() {
        return this.subjects.HIDE_VIDEO;
    }
    public get pronunciationRecordSuccess$() {
        return this.subjects.PRONUNCIATION_RECORD_SUCCESS;
    }

    public subjects: Hotkeys<Subject<void>> = Object.fromEntries(
        Object.keys(HotKeyEvents.defaultHotkeys())
            .map(action => [action, new Subject<void>()])
    ) as unknown as Hotkeys<Subject<void>>


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
            m.imageSearchService.queryImageRequest$.next({
                term: characters,
                cb: (s: string) => editingCard.photos$.next(photos?.concat(s))
            })
        });


        this.requestEditQuizWord$
            .pipe(
                withLatestFrom(m.quizService.quizCard.word$)
            ).subscribe(async ([_, word]) => {
            if (word) {
                m.editingCardManager.requestEditWord$.next(word);
            }
        });


        function setQuizResult(quizResultEasy$2: Subject<void>, recognitionScore1: SuperMemoGrade) {
            quizResultEasy$2.pipe(
                withLatestFrom(m.quizService.quizCard.word$)
            ).subscribe(([_, word]) => {
                if (word) {
                    m.quizManager.completeQuiz(word, recognitionScore1)
                }
            });
        }

        setQuizResult(this.quizResultEasy$, RecognitionMap.easy);
        setQuizResult(this.quizResultMedium$, RecognitionMap.medium);
        setQuizResult(this.quizResultHard$, RecognitionMap.hard);

        this.hide$.pipe(withLatestFrom(
            m.imageSearchService.queryImageRequest$,
            m.editingCardManager.showEditingCardPopup$
        )).subscribe(([_, imageQuery, showEditingCard]) => {
            if (imageQuery) {
                m.editingCardManager.showEditingCardPopup$.next(false);
            } else if (showEditingCard) {
                m.imageSearchService.queryImageRequest$.next(undefined);
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
                m.cardsRepository.deleteWords.next([learningLanguage]);
                m.editingCardManager.queEditingCard$.next(undefined)
            }
        })
    }

    public hotkeyActions(): Hotkeys<Subject<void>> {
        return this.subjects;
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
            ADVANCE_QUIZ: [' '],
            RECORD_QUIZ_WORD: ['r'],
            REQUEST_EDIT_WORD: ['e'],
            HIDE_VIDEO: ['v'],
            PRONUNCIATION_RECORD_SUCCESS: ['p'],

        }
    }
}