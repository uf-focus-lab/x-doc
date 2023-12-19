/* ---------------------------------------------------------
 * Copyright (c) 2023 Yuxuan Zhang @ FOCUS Lab
 * This source code is licensed under the MIT license.
 * You may find the full license in project root directory.
 * ------------------------------------------------------ */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

import get_title from './get-title.js';

const doc_root = resolve(process.env.PWD, 'docs');
const index = readFileSync(resolve(doc_root, 'index.json'), 'utf8');

export const nav = [];

let ctx;
for (const { context = {}, link = '' } of JSON.parse(index)) {
    let { h2 = "About", h3 } = context;
    h2 = h2.replace(/\:$/, '');
    if (h2 !== ctx?.text) {
        ctx = { text: h2, items: [], sub_dirs: {} };
        nav.push(ctx);
    }
    let { items } = ctx;
    if (h3 !== undefined) {
        h3 = h3.replace(/\:$/, '');
        if (!ctx.sub_dirs[h3]) {
            ctx.sub_dirs[h3] = { text: h3, items: [] };
            ctx.items.push(ctx.sub_dirs[h3]);
        }
        items = ctx.sub_dirs[h3].items;
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
