/* ---------------------------------------------------------
 * Copyright (c) 2023 Yuxuan Zhang, web-dev@z-yx.cc
 * This source code is licensed under the MIT license.
 * You may find the full license in project root directory.
 * ------------------------------------------------------ */

import { existsSync, readFileSync } from 'node:fs';

import { baseURL } from '../lib/env.js';

import writeFile, { init_dir, renew, cleanup } from '../lib/output.js';
import { source, all_files } from './fetch-raw.js'
import transform from './transform.js'
import { compare_path } from '../lib/utility.js';

await init_dir();

const src = new URL(baseURL.href + 'index.html')

// Prepare all source files
const raw_list = await (async () => {
    if (existsSync('docs/raw.list')) {
        console.log("[@] Using existing resource list");
        const list = readFileSync('docs/raw.list', 'utf-8')
            .split('\n')
            .filter(Boolean);
        list.sort(compare_path);
        list.forEach(src_id => renew(src_id + '.raw.html'));
        await writeFile('raw.list', list.join('\n'));
        return list;
    } else {
        await source(src);
        const list = await all_files();
        list.sort(compare_path);
        await writeFile('raw.list', list.join('\n'));
        return list;
    }
})();

// Map to new source tree
const remap = [];

const LUT = {
    "libX11/i18n/compose/libX11-keys": "libX11/i18n/compose/"
}

match_next_label: for (const src_id of raw_list) {
    if (src_id in LUT) {
        remap.push(LUT[src_id]);
        continue;
    }
    const dirs = src_id.split('/'), tmp = [];
    match_deeper_dir: while (dirs.length > 1) {
        tmp.push(dirs.shift());
        const dir = tmp.join('/') + '/';
        for (const other_src_id of raw_list) {
            if (src_id === other_src_id) continue;
            if (other_src_id.startsWith(dir))
                continue match_deeper_dir;
        }
        remap.push([...tmp, ''].join('/'));
        continue match_next_label;
    }
    remap.push(src_id.replace(/\/index$/, '/'));
}

await writeFile('remap.list', Object.values(remap).sort(compare_path).join('\n'));

if (remap.length !== raw_list.length)
    throw new Error("Remap list length mismatch");

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
// for (const src_id in raw_list) {
//     dir_push(dir_tree, basename(src_id), ...dirname(src_id).split('/'));
// }

// Transform source files
await transform(raw_list);

cleanup();
