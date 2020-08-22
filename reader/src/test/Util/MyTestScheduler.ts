import {TestScheduler} from "rxjs/testing";
import {Observable, Subject, Subscription} from "rxjs";
import {FlushableTest, swapIndexes} from "./Util";
import {isSubObject} from "../Graph/CompareFunctions";
import {CausallyOrderable} from "../Graph/CasuallyOrderable";
import {CausalTree} from "../Graph/CausalTree";

export class MyTestScheduler extends TestScheduler {
    expectOrderings(
        observables: {[key: string]: Observable<any>},
        causalTree: CausalTree,
        maxLength: number = 20
    ) {
        /**
         * The test scheduler ends when the last hot observable finishes
         * Use this one for length by default
         */
        const maxLengthObservable = this.createHotObservable(`${'-'.repeat(maxLength)}a`);

        const expectedRoots = causalTree.getLastEmissionRoots();
        const treesBeingTraversed = {
            treesBeingTraversed: causalTree.getFirstEmissionRoots()
        };
        const visitedNodeLabels = new Set<string>();

        const emittedValues: CausallyOrderable[][] = Object.keys(observables).map(() => []);
        const flushTest: FlushableTest = {
            ready: false,
            actual: []
        }

        function executeSubscribersInTree(): boolean {
            const newWalkingRoots: CausallyOrderable[] = [];
            const changed = {changed: false};
            const copyWalkingRoots = treesBeingTraversed.treesBeingTraversed.slice();
            for (let i = 0; i < copyWalkingRoots.length; i++) {
                const walkingRoot = copyWalkingRoots[i];
                if (walkingRoot.next) {
                    const children = walkingRoot.ancestors;
                    changed.changed = true;
                    treesBeingTraversed.treesBeingTraversed = [
                        ...copyWalkingRoots.slice(0, i),
                        ...children,
                        ...copyWalkingRoots.slice(i + 1)// TODO this goes i + 1 -> lastElement, right?
                    ];
                    emittedValues.push([{...walkingRoot, ancestors: []}])
                    flushTest.actual = [
                        walkingRoot
                    ];
                    (walkingRoot.value as Subject<any>).next(walkingRoot.next)
                    break;
                }
            }

            treesBeingTraversed.treesBeingTraversed = newWalkingRoots;
            return changed.changed;
        }

        /**
         * Every time an observable fires we potentially advance another step down our expected tree
         * We only advance if this is the value we expect
         * My only concern, is that I might advance mistakenly
         * I guess I should keep track of previous emissions and make sure this emission fits the profile?
         * Confusing.
         */
        function pruneValueInTree(causalEvent: CausallyOrderable) {
            const newWalkingRoots: CausallyOrderable[] = [];
            treesBeingTraversed.treesBeingTraversed.forEach(walkingRoot => {
                if (isSubObject(causalEvent.value, walkingRoot.value)) {
                    visitedNodeLabels.add(walkingRoot.nodeLabel as string)
                    const childrenWithSatisfiedDependencies = walkingRoot.ancestors.filter(child => {
                            const dependencies = causalTree.getAdjListThatMovesForwardsInTime()[child.nodeLabel as string] || [];
                            return dependencies.every(dependency => visitedNodeLabels.has(dependency))
                        }
                    )
                    newWalkingRoots.push(...childrenWithSatisfiedDependencies);
                } else {
                    newWalkingRoots.push(walkingRoot);
                }
            });
            treesBeingTraversed.treesBeingTraversed = newWalkingRoots;
        }

        function onValueEmitted(orderable: CausallyOrderable) {
            // The last value emitted will be our tree root
            flushTest.actual = [orderable];
            // Keep moving down the tree with this value?
            // We should only do it once
            pruneValueInTree(orderable.value);
            // This we can do as many times as there are subscribers.next here
            while (executeSubscribersInTree()) {
            }
        }
        this.schedule(() => {
            maxLengthObservable.subscribe(() => {});
        })

        Object.entries(observables).forEach(([observableLabel, observable], index) => {
            // We're assuming for now that everyone subscribes at the start and never unsubscribes
            this.schedule(() => {
                observable.subscribe(x => {
                    let items = {
                        value: x,
                        ancestors: emittedValues.map(emittedValueList => emittedValueList[emittedValueList.length - 1]).filter(v => v),
                        emitterName: observableLabel
                    };
                    onValueEmitted(items);
                    emittedValues[index].push(items)
                }, (error) => {
                    let items = {
                        error,
                        ancestors: emittedValues.map(emittedValueList => emittedValueList[emittedValueList.length - 1]).filter(v => v),
                        emitterName: observableLabel
                    };
                    onValueEmitted(items);
                    emittedValues[index].push(
                        items
                    );
                }, () => {
                    let items = {
                        notification: "COMPLETE_NOTIFICATION",
                        ancestors: emittedValues.map(emittedValueList => emittedValueList[emittedValueList.length - 1]).filter(v => v),
                        emitterName: observableLabel
                    };
                    onValueEmitted(items);
                    emittedValues[index].push(
                        items
                    );
                });

                // @ts-ignore
                observable.subscriptions && swapIndexes(observable.subscriptions, 0, observable.subscriptions.length - 1);
                // @ts-ignore
                observable.observers && swapIndexes(observable.observers, 0, observable.observers.length - 1);
            }, 0);
            this.schedule(() => {
                executeSubscribersInTree();
            }, 0)
        });

        // @ts-ignore
        this.flushTests.push(flushTest);
        // @ts-ignore
        const {runMode} = this;

        flushTest.ready = true;
        flushTest.expected = expectedRoots;
    }


    /*

        expectOrdering(orderings: orderingObservable[]) {
            const correspondingOrderings: causallyOrderable[][] = orderings.map(() => []);
            /!**
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
             *!/
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
                if (unsubscriptionFrame !== Infinity) {
                    // this.schedule(() => subscription.unsubscribe(), unsubscriptionFrame);
                }
            }
            // @ts-ignore
            this.flushTests.push(flushTest);
            // @ts-ignore
            const {runMode} = this;
            return {
                toBe(orderings: marbleValue[]) {
                    // Now we parse the marbles our way
                    // We basically assemble corresponding orderings on our end
                    const allMarbles = orderings.map(ordering => ordering.marbles);
                    const allValues = orderings.map(ordering => ordering.values);
                    const mergedValues = allValues.reduce((acc, values) => ({...acc, ...values}), {});
                    const longestMarble = Math.max(...allMarbles.map(marbles => marbles.length));
                    flushTest.ready = true;
                    const expected: causallyOrderable[][] = allMarbles.map(() => []);
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

    */
}