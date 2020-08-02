import {AtomizedDocument} from "../../lib/Atomize/AtomizedDocument";
import {readFileSync} from "fs-extra";
import {join} from "path";
import {Dictionary} from "lodash";
import {RecognitionMap} from "../../lib/Scheduling/SRM";
import {QuizManager, QuizResult} from "../../lib/Manager/QuizManager";
import {RunHelpers} from "rxjs/internal/testing/TestScheduler";
import {Observable, Subject} from "rxjs";
import {ScheduleManager} from "../../lib/Manager/ScheduleManager";
import CardManager from "../../lib/Manager/CardManager";
import {MyAppDatabase} from "../../lib/Storage/AppDB";
import {ScheduleQuiz} from "../../lib/Manager/ManagerConnections/Schedule-Quiz";
import {CardScheduleQuiz} from "../../lib/Manager/ManagerConnections/Card-Schedule-Quiz";

export function getAtomizedSentences(paths: string) {
    return AtomizedDocument.atomizeDocument(readFileSync(join(__dirname, '../fixtures', paths)).toString())
        .getAtomizedSentences();
}

export type Subscriber<U> = Subject<U> | ((v: U) => any);

export class Marbles<T, U = T> {
    static new<A, B = A>(helpers: RunHelpers) {
        return new Marbles<A, B>(helpers)
    }

    public values: Dictionary<T> = {};
    private currentLetter = 'a';
    private marbles: string[] = [];
    private pipe: ((o$: Observable<T>) => Observable<U>) | undefined;
    private subject$: Subscriber<U> | undefined;
    private observable$: Observable<T> | undefined;
    constructor(
        public helpers: RunHelpers,
    ) {}

    setPipe(p: (o$: Observable<T>) => Observable<U>) {
        this.pipe = p;
        return this;
    }
    setTargetSubject(s: Subscriber<U>) {
        this.subject$ = s;
        return this;
    }
    setExpectedObservable(o: Observable<T>) {
        this.observable$ = o;
        return this;
    }

    addValue(...argsToPushThisFrame: T[]) {
        const lettersAdded = [];
        for (let i = 0; i < argsToPushThisFrame.length; i++) {
            this.values[this.currentLetter] = argsToPushThisFrame[i];
            lettersAdded.push(this.currentLetter);
            this.currentLetter = incLetter(this.currentLetter);
        }
        this.marbles.push(`(${lettersAdded.join('')})`)
    }

    addTime(n?: number) {
        this.marbles.push(n ? '-'.repeat(n) : '-')
    }

    getMarbles(): string {
        return this.marbles.join('')
    }

    done() {
        if (this.subject$) {
            if (this.pipe) {
                // @ts-ignore
                this.helpers.hot(this.getMarbles(), this.values).pipe(this.pipe).subscribe(this.subject$);
            } else {
                // @ts-ignore
                this.helpers.hot(this.getMarbles(), this.values).subscribe(this.subject$);
            }
        } else if (this.observable$) {
            this.helpers.expectObservable(this.observable$)
                .toBe(this.getMarbles(), this.values)
        } else {
            throw new Error("Marble has no done action")
        }
    }
}

export function incLetter(l: string) {
    return String.fromCharCode(l.charCodeAt(0) + 1);
}

export function countFactory(word: string, n=1) {
    return {
        word,
        count: n,
        book: ''
    }
}

let recognitionIdCounter = 0;

export function recognitionFactory(word: string, score?: number) {
    return {
        word,
        timestamp: new Date(),
        recognitionScore: score || RecognitionMap.easy,
        id: ++recognitionIdCounter
    }
}
export function quizResultFactory(word: string, result: number): QuizResult {
    return {
        word: word,
        score: result
    }
}

export class MarbleGroup<T extends (Dictionary<Marbles<any>> | Marbles<any>[])> {
    private marbles: T;

    constructor(marbles: T) {
        this.marbles = marbles;
    }

    a(...marbles: Marbles<any>[]){
        return new MarbleGroup(marbles);
    }

    o(marbles: Dictionary<any>) {
        return new MarbleGroup(marbles)
    }

    tick(...args: (any | this)[]) {
        if (Array.isArray(this.marbles)) {
            for (let i = 0; i < args.length; i++) {
                const arg = args[i];
                if (arg === this) {
                    this.marbles[i].addTime()
                } else {
                    if (Array.isArray(arg)) {
                        this.marbles[i].addValue(...arg);
                    } else {
                        this.marbles[i].addValue(arg);
                    }
                }
            }
        } else {
            const usedKeys = new Set<string>();
            const allKeys = new Set<string>(Object.keys(this.marbles));
            let entries = Object.entries(args[0]);
            for (let i = 0; i < entries.length; i++) {
                const [key, val] = entries[i];
                usedKeys.add(key);
                let marble = (this.marbles as Dictionary<Marbles<any>>)[key];
                if (Array.isArray(val)) {
                    marble.addValue(...val);
                } else {
                    marble.addValue(val);
                }
            }
            const difference = new Set(Array.from(allKeys.values()).filter(key => !usedKeys.has(key)));
            difference.forEach(unusedKey => {
                (this.marbles as Dictionary<Marbles<any>>)[unusedKey].addTime()
            })
        }
    }

    done() {
        Object.values(this.marbles).forEach(marbles => marbles.done());
    }

    skip() {
        return this;
    }

    print() {
        console.log('printing');
        Object.values(this.marbles).forEach(m => console.log(m.getMarbles()))
    }
}

export function ScheduleQuizCard(db: MyAppDatabase) {
    const scheduleManager = new ScheduleManager(db);
    const quizManager = new QuizManager();
    const cardManager = new CardManager(db);
    ScheduleQuiz(scheduleManager, quizManager);
    CardScheduleQuiz(cardManager, scheduleManager, quizManager);
    return {scheduleManager, quizManager, cardManager};
}