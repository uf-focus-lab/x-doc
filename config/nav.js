/* ---------------------------------------------------------
 * Copyright (c) 2023 Yuxuan Zhang, web-dev@z-yx.cc
 * This source code is licensed under the MIT license.
 * You may find the full license in project root directory.
 * ------------------------------------------------------ */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

import get_title from './get-title.js';

const doc_root = resolve(process.env.PWD, 'docs');
const index = readFileSync(resolve(doc_root, 'index.json'), 'utf8');

const nav = [];

let ctx;
for (const { context = {}, link = '' } of JSON.parse(index)) {
    let { H2 = "About", H3 } = context;
    H2 = H2.replace(/\:$/, '');
    if (H2 !== ctx?.text) {
        ctx = { text: H2, items: [], sub_dirs: {} };
        nav.push(ctx);
    }
    let { items } = ctx;
    if (H3 !== undefined) {
        H3 = H3.replace(/\:$/, '');
        if (!ctx.sub_dirs[H3]) {
            ctx.sub_dirs[H3] = { text: H3, items: [] };
            ctx.items.push(ctx.sub_dirs[H3]);
        }
        items = ctx.sub_dirs[H3].items;
    }
    items.push({ text: get_title(link), link });
}

for (const el of nav) {
    delete el.sub_dirs;
}

try {
    mkdirSync('var', { recursive: true })
    writeFileSync(
        resolve('var', 'nav.json'),
        JSON.stringify(nav, null, 4)
    );
} catch (e) {
    console.error(e);
}

export default nav;