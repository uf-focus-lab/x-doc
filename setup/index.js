/* ---------------------------------------------------------
 * Copyright (c) 2023 Yuxuan Zhang @ FOCUS Lab
 * This source code is licensed under the MIT license.
 * You may find the full license in project root directory.
 * ------------------------------------------------------ */

import { existsSync, readFileSync } from 'node:fs';

import { baseURL } from '../lib/env.js';

import writeFile, { init_dir, renew, cleanup } from '../lib/output.js';
import { source, all_files } from './fetch_raw.js'
import transform from './transform.js'

await init_dir();

const src = new URL(baseURL.href + 'index.html')
/**
 * @returns {IterableIterator<[String, String]>}
 */
function* segments(seg1, seg2) {
    for (let i = 0; i < Math.min(seg1.length, seg2.length); i++) {
        yield seg1[i], seg2[i];
    }
}

// Prepare all source files
const id_list = await (async () => {
    if (existsSync('docs/list.txt')) {
        console.log("[@] Using existing resource list");
        renew('list.txt');
        const list = readFileSync('docs/list.txt', 'utf-8')
            .split('\n')
            .filter(Boolean);
        list.forEach(src_id => renew(src_id + '.raw.html'));
        return list;
    } else {
        await source(src);
        const list = await all_files();
        list.sort((a, b) => {
            a = a.split('/');
            b = b.split('/');
            if (a.length !== b.length)
                return a.length - b.length;
            for (const [x, y] of segments(a, b)) {
                // First compare by length
                if (x.length !== y.length)
                    return x.length - y.length;
                // Then compare by string
                if (x !== y)
                    return x.localeCompare(y);
            }
        });
        await writeFile('list.txt', list.join('\n'));
        return list;
    }
})();

// // Transform shallow tree
// const dir_tree = { ".": [] };
// function dir_push(dir, value, ...dirs) {
//     if (dirs.length > 0) {
//         const key = dirs.shift();
//         if (!(key in dir))
//             dir[key] = { ".": [] };
//         dir_push(dir[key], value, ...dirs);
//     } else {
//         dir["."].push(value);
//     }
// }
// for (const src_id in id_list) {
//     dir_push(dir_tree, basename(src_id), ...dirname(src_id).split('/'));
// }

// Transform source files
await transform(id_list);

cleanup();
