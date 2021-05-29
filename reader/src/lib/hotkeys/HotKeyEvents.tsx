import { Manager } from '../manager/Manager'
import { of, Subject } from 'rxjs'
import { switchMap, withLatestFrom } from 'rxjs/operators'
import { Hotkeys } from './hotkeys.interface'

export class HotKeyEvents {
    public get markWordAsKnown$() {
        return this.subjects.MARK_WORD_AS_KNOWN
    }
    public get openImageSearch$() {
        return this.subjects.OPEN_IMAGE_SEARCH
    }
    public get hide$() {
        return this.subjects.HIDE
    }
    public get quizResultEasy$() {
        return this.subjects.QUIZ_RESULT_EASY
    }
    public get quizResultIgnore$() {
        return this.subjects.QUIZ_RESULT_IGNORE
    }
    public get quizResultMedium$() {
        return this.subjects.QUIZ_RESULT_MEDIUM
    }
    public get recordQuizword$() {
        return this.subjects.RECORD_QUIZ_WORD
    }
    public get quizResultHard$() {
        return this.subjects.QUIZ_RESULT_HARD
    }
    public get requestEditQuizWord$() {
        return this.subjects.REQUEST_EDIT_WORD
    }
    public get advanceQuiz$() {
        return this.subjects.ADVANCE_QUIZ
    }
    public get hideVideo$() {
        return this.subjects.HIDE_VIDEO
    }
    public get pronunciationRecordSuccess$() {
        return this.subjects.PRONUNCIATION_RECORD_SUCCESS
    }

    public subjects: Hotkeys<Subject<void>> = (Object.fromEntries(
        Object.keys(HotKeyEvents.defaultHotkeys()).map((action) => [
            action,
            new Subject<void>(),
        ]),
    ) as unknown) as Hotkeys<Subject<void>>

    constructor(public m: Manager) {}

    public startListeners() {
        const m = this.m
    }

    public hotkeyActions(): Hotkeys<Subject<void>> {
        return this.subjects
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
            QUIZ_RESULT_IGNORE: ['z'],
            ADVANCE_QUIZ: ['q'],
            RECORD_QUIZ_WORD: ['r'],
            REQUEST_EDIT_WORD: ['e'],
            HIDE_VIDEO: ['v'],
            PRONUNCIATION_RECORD_SUCCESS: ['p'],
            MARK_WORD_AS_KNOWN: ['k']
        }
    }
}
