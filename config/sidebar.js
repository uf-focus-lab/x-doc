/* ---------------------------------------------------------
 * Copyright (c) 2023 Yuxuan Zhang @ FOCUS Lab
 * This source code is licensed under the MIT license.
 * You may find the full license in project root directory.
 * ------------------------------------------------------ */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';

import get_title from './get-title.js';

const doc_root = resolve(process.env.PWD, 'docs');
const list = readFileSync(resolve(doc_root, 'remap.list'), 'utf8')
    .split('\n')
    .filter(Boolean)
    .map(l => l.trim());

export const sidebar = list.reduce((dict, src_id) => {
    const [dir, ...paths] = src_id.split('/');
    const title = dir;
    const key = `/${dir}/`;
    if (paths.length === 0) return dict;
    if (!(key in dict)) dict[key] = {
        text: title,
        items: []
    };
    dict[key].items.push('/' + src_id);
    return dict;
}, {});

function reform(obj, key) {
    const dirs = [];
    const items = obj.items.map(link => {
        const text = get_title(link);
        if (link.endsWith('/')) {
            dirs.push(link);
            const sub_items = JSON.parse(readFileSync('docs' + link + 'index.json'), 'utf8');
            check_sub_link: for (const _link of obj.items) {
                if (!_link.startsWith(link)) continue;
                if (link === _link) continue;
                const _text = get_title(_link);
                for (const sub_item of sub_items) {
                    if (sub_item.link === _link)
                        continue check_sub_link;
                }
                sub_items.push({ text: _text, link: _link });
            }
            if (sub_items.length === 0) return { text, link };
            else return {
                text, link, collapsed: true, items: sub_items
            }
        } else {
            return { text, link }
        }
    })
    // Filter already included entries
    obj.items = items.filter(({ link }) => {
        if (link.endsWith('/')) return true;
        for (const dir of dirs) {
            if (link.startsWith(dir)) return false;
        }
        return true;
    })
}

Object.entries(sidebar).forEach(([key, el]) => reform(el, key));

try {
    mkdirSync('var', { recursive: true })
    writeFileSync(
        resolve('var', 'sidebar.json'),
        JSON.stringify(sidebar, null, 4)
    );
} catch (e) {
    console.error(e);
}
