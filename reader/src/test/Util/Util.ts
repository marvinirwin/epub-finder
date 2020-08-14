import {AtomizedDocument} from "../../lib/Atomized/AtomizedDocument";
import {readFileSync} from "fs-extra";
import {join} from "path";
import {Dictionary} from "lodash";
import {RecognitionMap} from "../../lib/Scheduling/SRM";
import {QuizManager, QuizResult} from "../../lib/Manager/QuizManager";
import {RunHelpers} from "rxjs/internal/testing/TestScheduler";
import {Observable, PartialObserver, Subject, Subscription} from "rxjs";
import {ScheduleManager} from "../../lib/Manager/ScheduleManager";
import CardManager from "../../lib/Manager/CardManager";
import {MyAppDatabase} from "../../lib/Storage/AppDB";
import {ScheduleQuiz} from "../../lib/Manager/ManagerConnections/Schedule-Quiz";
import {CardScheduleQuiz} from "../../lib/Manager/ManagerConnections/Card-Schedule-Quiz";
import {TestScheduler} from "rxjs/testing";
import moment from "moment";

// import { TestMessage } from "rxjs/internal/testing/TestMessage";
export interface TestMessage {

    frame: number;
    notification: Notification<any>;
    isGhost?: boolean;
}

//import {Notification} from "rxjs/src/internal/Notification";
export class Notification<T> {
    hasValue: boolean;

    constructor(public kind: 'N' | 'E' | 'C', public value?: T, public error?: any) {
        this.hasValue = kind === 'N';
    }

    /**
     * Delivers to the given `observer` the value wrapped by this Notification.
     * @param {Observer} observer
     * @return
     */
    observe(observer: PartialObserver<T>): any {
        switch (this.kind) {
            case 'N':
                // @ts-ignore
                return observer.next && observer.next(this.value);
            case 'E':
                return observer.error && observer.error(this.error);
            case 'C':
                return observer.complete && observer.complete();
        }
    }

    /**
     * Given some {@link Observer} callbacks, deliver the value represented by the
     * current Notification to the correctly corresponding callback.
     * @param {function(value: T): void} next An Observer `next` callback.
     * @param {function(err: any): void} [error] An Observer `error` callback.
     * @param {function(): void} [complete] An Observer `complete` callback.
     * @return {any}
     */
    do(next: (value: T) => void, error?: (err: any) => void, complete?: () => void): any {
        const kind = this.kind;
        switch (kind) {
            case 'N':
                // @ts-ignore
                return next && next(this.value);
            case 'E':
                return error && error(this.error);
            case 'C':
                return complete && complete();
        }
    }

    /**
     * Takes an Observer or its individual callback functions, and calls `observe`
     * or `do` methods accordingly.
     * @param {Observer|function(value: T): void} nextOrObserver An Observer or
     * the `next` callback.
     * @param {function(err: any): void} [error] An Observer `error` callback.
     * @param {function(): void} [complete] An Observer `complete` callback.
     * @return {any}
     */
    accept(nextOrObserver: PartialObserver<T> | ((value: T) => void), error?: (err: any) => void, complete?: () => void) {
        if (nextOrObserver && typeof (<PartialObserver<T>>nextOrObserver).next === 'function') {
            return this.observe(<PartialObserver<T>>nextOrObserver);
        } else {
            return this.do(<(value: T) => void>nextOrObserver, error, complete);
        }
    }

    /**
     * Returns a simple Observable that just delivers the notification represented
     * by this Notification instance.
     * @return {any}
     */
    toObservable(): Observable<T> {
        const kind = this.kind;
        switch (kind) {
            case 'N':
                // @ts-ignore
                return of(this.value);
            case 'E':
                // @ts-ignore
                return throwError(this.error);
            case 'C':
                // @ts-ignore
                return empty();
        }
        throw new Error('unexpected notification kind value');
    }

    private static completeNotification: Notification<any> = new Notification('C');
    private static undefinedValueNotification: Notification<any> = new Notification('N', undefined);

    /**
     * A shortcut to create a Notification instance of the type `next` from a
     * given value.
     * @param {T} value The `next` value.
     * @return {Notification<T>} The "next" Notification representing the
     * argument.
     * @nocollapse
     */
    static createNext<T>(value: T): Notification<T> {
        if (typeof value !== 'undefined') {
            return new Notification('N', value);
        }
        return Notification.undefinedValueNotification;
    }

    /**
     * A shortcut to create a Notification instance of the type `error` from a
     * given error.
     * @param {any} [err] The `error` error.
     * @return {Notification<T>} The "error" Notification representing the
     * argument.
     * @nocollapse
     */
    static createError<T>(err?: any): Notification<T> {
        // @ts-ignore
        return new Notification('E', undefined, err);
    }

    /**
     * A shortcut to create a Notification instance of the type `complete`.
     * @return {Notification<any>} The valueless "complete" Notification.
     * @nocollapse
     */
    static createComplete(): Notification<any> {
        return Notification.completeNotification;
    }
}

interface FlushableTest {
    ready: boolean;
    actual?: any[];
    expected?: any[];
}

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
    ) {
    }

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

export function countFactory(word: string, n = 1) {
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

    a(...marbles: Marbles<any>[]) {
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


function swapIndexes(arr: Array<any>, i1:number, i2:number){
    [arr[i1], arr[i2]] = [arr[i2], arr[i1]];
}

export function ScheduleQuizCard(db: MyAppDatabase) {
    const scheduleManager = new ScheduleManager(db);
    const quizManager = new QuizManager();
    const cardManager = new CardManager(db);
    ScheduleQuiz(scheduleManager, quizManager);
    CardScheduleQuiz(cardManager, scheduleManager, quizManager);
    return {scheduleManager, quizManager, cardManager};
}

export function getTestScheduler() {
    return new MyTestScheduler((actual, expected) => {
        if (moment.isMoment(expected)) {
            expect(moment(actual).isSame(expected, 'day'));
        } else {
            expect(actual).toEqual(expected);
        }
    });
}

export type orderingObservable = { observable: Observable<any>, subscriptionMarbles: string | null };
export type ordering = { error?: any, value?: any, notification?: any, ancestors: ordering[] };
export type marbleValue = {marbles: string, values: {[key: string]: any}};

export class MyTestScheduler extends TestScheduler {
    expectOrdering(orderings: orderingObservable[]) {
        const correspondingOrderings: ordering[][] = orderings.map(() => []);
        /**
         * How do I may the orderings?
         * Input:
         * ----a----c---d
         * -------b-------e
         * ---f-----g--f
         *
         * Output:
         * [v, v, v]
         * [v, v, v, v, v]
         * [v, v, v]
         */
        const actual: TestMessage[] = [];
        const flushTest: FlushableTest = {
            actual: correspondingOrderings,
            ready: false
        };
        for (let i = 0; i < orderings.length; i++) {
            const {observable, subscriptionMarbles} = orderings[i];
            const correspondingOrdering = correspondingOrderings[i];
            const subscriptionParsed = TestScheduler.parseMarblesAsSubscriptions(
                // @ts-ignore
                subscriptionMarbles,
                // @ts-ignore
                this.runMode
            );
            const subscriptionFrame = subscriptionParsed.subscribedFrame === Infinity ?
                0 : subscriptionParsed.subscribedFrame;
            const unsubscriptionFrame = subscriptionParsed.unsubscribedFrame;
            let subscription: Subscription;
            this.schedule(() => {
                subscription = observable.subscribe(x => {
                    correspondingOrdering.push(
                        {
                            value: x,
                            ancestors: correspondingOrderings.map(ordering => ordering[ordering.length - 1]).filter(v => v)
                        }
                    );
                }, (error) => {
                    correspondingOrdering.push(
                        {
                            error,
                            ancestors: correspondingOrderings.map(ordering => ordering[ordering.length - 1]).filter(v => v)
                        }
                    );
                }, () => {
                    correspondingOrdering.push(
                        {
                            notification: "COMPLETE_NOTIFICATION",
                            ancestors: correspondingOrderings.map(ordering => ordering[ordering.length - 1]).filter(v => v)
                        }
                    );
                });

                // @ts-ignore
                observable.subscriptions && swapIndexes(observable.subscriptions, 0, observable.subscriptions.length - 1);
                // @ts-ignore
                observable.observers && swapIndexes(observable.observers, 0, observable.observers.length - 1);
            }, subscriptionFrame);
            if (unsubscriptionFrame !== Infinity) {
                this.schedule(() => subscription.unsubscribe(), unsubscriptionFrame);
            }
        }
        // @ts-ignore
        this.flushTests.push(flushTest);
        // @ts-ignore
        const { runMode } = this;
        return {
            toBe(orderings: marbleValue[]) {
                // Now we parse the marbles our way
                // We basically assemble corresponding orderings on our end
                const allMarbles = orderings.map(ordering => ordering.marbles);
                const allValues = orderings.map(ordering => ordering.values);
                const mergedValues = allValues.reduce((acc, values) => ({...acc, ...values}), {});
                const longestMarble = Math.max(...allMarbles.map(marbles => marbles.length));
                flushTest.ready = true;
                const expected: ordering[][] = allMarbles.map(() => []);
                for (let i = 0; i < longestMarble; i++) {
                    const newExpected = allMarbles
                        .map(marbles => marbles[i])
                        .map(key => {
                            if (mergedValues.hasOwnProperty(key)) {
                                return ({
                                    value: mergedValues[key],
                                    ancestors: expected.map(
                                        expectedOrderings => expectedOrderings.reverse().find(ancestor => !!ancestor)
                                    ).filter(ancestor => !!ancestor)
                                })
                            }
                            return undefined;
                        });
                    newExpected.forEach((newExpectedElement, index) => {
                        let newExpectedElement1 = newExpected[index];
                        if (newExpectedElement1) {
                            // @ts-ignore
                            expected[index].push(newExpectedElement1)
                        }
                    })
                }
                flushTest.expected = expected;
            }
        };
    }
}

export function ord(obs$: Observable<any>) {
    return {observable: obs$, subscriptionMarbles: null};
}

export function mv(marbles: string, values: { [key: string]: any }): marbleValue {
    return {marbles, values};
}