/* ---------------------------------------------------------
 * Copyright (c) 2023 Yuxuan Zhang, web-dev@z-yx.cc
 * This source code is licensed under the MIT license.
 * You may find the full license in project root directory.
 * ------------------------------------------------------ */

// Sort source files 
export function compare_path(_a, _b) {
    const a = _a.split('/'), b = _b.split('/');
    while (a.length && b.length) {
        const [x, y] = [a.shift(), b.shift()]
        if (x === y) continue;
        // Index file first
        if (x === 'index') return -1;
        if (y === 'index') return 1;
        // Shorter path first
        return 0;
    }
};

/**
 * @template T
 * @returns {{
 * promise: Promise<T>,
 * resolve: (value: T) => void,
 * reject: (error: any) => void,
 * }} a deferred promise with its resolve/reject handles
 */
export function deferPromise() {
    let resolve, reject;
    const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
}

/** @template T, R */
class AsyncGenerator {

    [Symbol.asyncIterator]() {
        return this;
    }

    // =================== Receiver ===================
    #data_subscribers = [];
    next() {
        const { promise, resolve, reject } = deferPromise();
        this.#data_subscribers.push({ resolve, reject });
        return promise;
    }

    #return_subscribers = [];
    async return(value) {
    }
    // =================== Generator ===================
}

/**
 * Create async generator with callback handlers
 * @template T, R
 * @returns {[AsyncGenerator<T, R>, {
 * yield: (value: T) => void,
 * return: (value: R) => void,
 * throw: (error: any) => void,
 * }]}
 */
export function createAsyncGenerator() {
    let nextEvent = deferPromise();
    let nextValue;
    async function* generator() {
        while (await nextEvent.promise) {
            yield nextValue;
            nextEvent = deferPromise();
        }
        return nextValue;
    }
    return [
        generator(),
        {
            yield(value) {
                nextValue = value;
                nextEvent.resolve(true);
            },
            return(value) {
                nextValue = value;
                nextEvent.resolve(false);
            },
            throw(error) {
                nextEvent.reject(error);
            }
        }
    ];
}
