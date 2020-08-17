import {TestScheduler} from "rxjs/testing";
import {Observable, Subscription} from "rxjs";
import {causallyOrderable, FlushableTest, swapIndexes} from "./Util";

export class MyTestScheduler extends TestScheduler {
    public static orderingCompareFn(actualRoots: causallyOrderable[], expectedRoots: causallyOrderable[]) {
        let b = expectedRoots
            .every(expectedRoot => {
                let find = actualRoots
                    .find(actualRoot => {
                        return MyTestScheduler.isSubTree(actualRoot, expectedRoot);
                    });
                return find;
                }
            );
        return b
        ;
    }

    public static isSubTree(tree: causallyOrderable, subTree: causallyOrderable): boolean {

        if (!tree || !subTree) return false;
        let treesAreEqual = MyTestScheduler.treeSubSet(tree, subTree);
        let treeHasChildWhichIsEqual = tree.ancestors.find(ancestor => {
            return MyTestScheduler.isSubTree(ancestor, subTree);
        });
        let isSubTreeResult = treesAreEqual ||
            !!treeHasChildWhichIsEqual;
        return isSubTreeResult
            ;
    }

    private static treeSubSet(tree: causallyOrderable, subTree: causallyOrderable): boolean {
        if (!tree && !subTree) {
            return true;
        }
        if (!tree && subTree) {
            return false;
        }
        if (!tree && !subTree) {
            return false;
        }

        return tree.value === subTree.value &&
            subTree.ancestors.every(subTreeAncestor =>
                tree.ancestors.find(treeAncestor =>
                    MyTestScheduler.treeSubSet(treeAncestor, subTreeAncestor)
                )
            )
            &&
            tree.ancestors.every(treeAncestor =>
                treeAncestor.ancestors.find(subTreeAncestor =>
                    MyTestScheduler.treeSubSet(treeAncestor, subTreeAncestor)
                )
            )
    }

    expectOrderings(...observables: Observable<any>[]) {
        const emittedValues: causallyOrderable[][] = observables.map(() => []);
        const actualRoots: causallyOrderable[] = [];
        const flushTest: FlushableTest = {
            ready: false
        }

        function setLastValue(value: any) {
            flushTest.actual = [value];
        }

        observables.forEach((observable, index) => {
            // We're assuming for now that everyone subscribes at the start and never unsubscribes
            let subscription: Subscription;
            this.schedule(() => {
                subscription = observable.subscribe(x => {
                    let items = {
                        value: x,
                        ancestors: emittedValues.map(emittedValueList => emittedValueList[emittedValueList.length - 1]).filter(v => v)
                    };
                    setLastValue(items);
                    emittedValues[index].push(
                        items
                    )
                }, (error) => {
                    let items = {
                        error,
                        ancestors: emittedValues.map(emittedValueList => emittedValueList[emittedValueList.length - 1]).filter(v => v)
                    };
                    setLastValue(items);
                    emittedValues[index].push(
                        items
                    );
                }, () => {
                    let items = {
                        notification: "COMPLETE_NOTIFICATION",
                        ancestors: emittedValues.map(emittedValueList => emittedValueList[emittedValueList.length - 1]).filter(v => v)
                    };
                    setLastValue(items);
                    emittedValues[index].push(
                        items
                    );
                });

                // @ts-ignore
                observable.subscriptions && swapIndexes(observable.subscriptions, 0, observable.subscriptions.length - 1);
                // @ts-ignore
                observable.observers && swapIndexes(observable.observers, 0, observable.observers.length - 1);
            }, 0);
        });
        // @ts-ignore
        this.flushTests.push(flushTest);
        // @ts-ignore
        const {runMode} = this;

        return {
            toHaveOrdering(rootOrderings: causallyOrderable[]) {
                flushTest.ready = true;
                flushTest.expected = rootOrderings;
            }
        };
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