/* ---------------------------------------------------------
 * Copyright (c) 2023 Yuxuan Zhang @ FOCUS Lab
 * This source code is licensed under the MIT license.
 * You may find the full license in project root directory.
 * ------------------------------------------------------ */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';

import get_title from './get-title.js';

const doc_root = resolve(process.env.PWD, 'docs');
const list = readFileSync(resolve(doc_root, 'list.txt'), 'utf8')
    .split('\n')
    .filter(Boolean)
    .map(l => l.trim());

export const sidebar = list.reduce((dict, src_id) => {
    let [dir, ...paths] = src_id.split('/');
    let title = dir;
    if (dir === 'man' && paths.length > 1) {
        title = paths.shift();
        dir = [dir, title].join('/');
    }
    dir = `/${dir}/`;
    if (paths.length === 0) return dict;
    if (!(dir in dict)) dict[dir] = {
        text: title,
        items: []
    };
    dict[dir].items.push('/' + src_id);
    return dict;
}, {});

// Find index or readme as default page
for (const key in sidebar) {
    if (sidebar[key].items.length === 1) {
        const [abs_path] = sidebar[key].items;
        const item = abs_path.replace(/^\/+/, '');
        if (existsSync(item + '.json')) {
            const index = JSON.parse(readFileSync(item + '.json', 'utf8'));
            if (Array.isArray(index))
                sidebar[key].items.push(...index.map(i => i?.link ?? i));
        }
    }
    sidebar[key].items = sidebar[key].items.map(item => {
        if (typeof item !== 'string') return item;
        return {
            text: get_title(item),
            link: item
        }
    });
}

try {
    mkdirSync('var', { recursive: true })
    writeFileSync(
        resolve('var', 'sidebar.json'),
        JSON.stringify(sidebar, null, 4)
    );
} catch (e) {
    console.error(e);
}
