/* ---------------------------------------------------------
 * Copyright (c) 2023 Yuxuan Zhang @ FOCUS Lab
 * This source code is licensed under the MIT license.
 * You may find the full license in project root directory.
 * ------------------------------------------------------ */

import os from 'node:os'

const N = os.cpus().length;

let proc_count = 0;
export const queue = []

/**
 * Create a new pooled promise
 * @param {(resolve: (value: any) => void, reject: (reason?: any) => void) => void} callback 
 * @returns 
 */
export default function PoolPromise(callback) {
    let resolve, reject;
    const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    })
    queue.push(() => {
        callback(resolve, reject);
        return promise;
    })
    if (proc_count < N) {
        // Create new executor
        proc_count++;
        (async () => {
            while (queue.length > 0) {
                try {
                    await queue.shift()()
                } catch (e) { }
            }
            proc_count--;
        })();
    }
    return promise;
}
