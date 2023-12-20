/* ---------------------------------------------------------
 * Copyright (c) 2023 Yuxuan Zhang, web-dev@z-yx.cc
 * This source code is licensed under the MIT license.
 * You may find the full license in project root directory.
 * ------------------------------------------------------ */

import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";
import { exec } from "node:child_process";

import writeFile, { renew } from '../lib/output.js';
import PoolPromise, { queue } from '../lib/pool.js'

const dir = dirname(fileURLToPath(import.meta.url))
const __transform__ = resolve(dir, 'task', 'transform-raw.js')

/**
 * Function to query the state of a resource id
 * @param {String[]} id_list List of src_ids to transform 
 */
export default async function transform(id_list) {
    const tasks = [];
    for (const src_id of id_list) {
        const task = PoolPromise((res, rej) =>
            exec(
                [process.argv[0], __transform__].join(' '),
                {
                    cwd: resolve('docs'),
                    env: { SRC_ID: src_id }
                },
                (err, stdout, stderr) => {
                    for (const line of stdout.split('\n').filter(Boolean)) {
                        if (line.startsWith('#')) console.log("[!] TRANSFORM   :", line.slice(1).trim());
                        else renew(line, true);
                    }
                    if (err) rej(err)
                    else if (stderr) rej(new Error(stderr))
                    else {
                        const prog = `(${queue.length.toString().padStart(4, ' ')} pending)`;
                        console.log("[@] Transformed :", prog, src_id);
                        res();
                    }
                })
        )
        tasks.push(task);
    }
    await Promise.all(tasks);
}
