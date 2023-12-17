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
    let { h2 = "About" } = context;
    h2 = h2.replace(/\:$/, '');
    if (h2 !== ctx?.text) {
        ctx = { text: h2, items: [] };
        nav.push(ctx);
    }
    ctx.items.push({ text: get_title(link), link });
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
