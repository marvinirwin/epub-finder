export interface QueryablePromise<T> extends Promise<T> {
    isPending: () => boolean;
    isRejected: () => boolean;
    isFulfilled: () => boolean;
}

/**
 * This function allow you to modify a JS Promise by adding some status properties.
 * Based on: http://stackoverflow.com/questions/21485545/is-there-a-way-to-tell-if-an-es6-promise-is-fulfilled-rejected-resolved
 * But modified according to the specs of promises : https://promisesaplus.com/
 */
export function MakeQuerablePromise<T>(promise: Promise<T> | QueryablePromise<T>): QueryablePromise<T> {
    // Don't modify any promise that has been already modified.
    if (promise.hasOwnProperty('isResolved')) return promise as QueryablePromise<T>;

    // Set initial state
    let isPending = true;
    let isRejected = false;
    let isFulfilled = false;

    // Observe the promise, saving the fulfillment in a closure scope.
    const result = promise.then(
        function (v) {
            isFulfilled = true;
            isPending = false;
            return v;
        },
        function (e) {
            isRejected = true;
            isPending = false;
            throw e;
        }
    ) as QueryablePromise<T>

    result.isFulfilled = function () {
        return isFulfilled;
    };
    result.isPending = function () {
        return isPending;
    };
    result.isRejected = function () {
        return isRejected;
    };
    return result;
}