/* ---------------------------------------------------------
 * Copyright (c) 2023 Yuxuan Zhang, web-dev@z-yx.cc
 * This source code is licensed under the MIT license.
 * You may find the full license in project root directory.
 * ------------------------------------------------------ */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';

import { compare_path } from '../lib/utility.js';
import get_title from './get-title.js';
import { get } from 'http';

const doc_root = resolve(process.env.PWD, 'docs');
const list = readFileSync(resolve(doc_root, 'remap.list'), 'utf8')
    .split('\n')
    .filter(Boolean)
    .map(l => l.trim());

const sidebar = list.reduce((dict, src_id) => {
    const [dir, ...paths] = src_id.split('/');
    if (paths.length === 0) {
        // Root level entry
        dict['/'].push('/' + src_id);
    } else {
        const key = '/' + (() => {
            if (dir === 'man' && paths.length > 1)
                return [dir, paths.shift()].join('/');
            else
                return dir;
        })() + '/';
        if (!(key in dict)) dict[key] = [];
        dict[key].push('/' + src_id);
    }
    return dict;
}, { '/': [] });

/**
 * @param {Array[string]} arr Array of all links under key
 * @param {*} key Key of the sidebar
 */
function reform(arr, key) {
    // [1st scan] all links ending with '/'
    const dirs = arr
        .filter(link => link.endsWith('/'))
        // Deeper path comes first
        .sort(compare_path)
        .reverse();
    // Pointers to sib-directories
    const sub_dirs = {};
    // [2nd scan] Retrieve sub-indexes from sub-directories
    for (const dir of dirs) {
        // Try to find index.json under this dir
        const json = resolve('docs' + dir, 'index.json');
        sub_dirs[dir] = {
            link: dir,
            text: get_title(dir),
            collapsed: true,
            items: JSON.parse(readFileSync(json, 'utf8'))
        }
    }
    // List of items as final result
    const items = [];
    // [3rd scan] Arrange links
    arrange_links: for (const link of arr) {
        const text = get_title(link);
        if (link in sub_dirs) {
            items.push(sub_dirs[link]);
        } else {
            // Check if link belongs to a sub-directory
            for (const dir of dirs) if (link.startsWith(dir)) {
                // Check if link is already included from index.json
                for (const sub_item of sub_dirs[dir].items) {
                    if ((sub_item?.link ?? sub_item) === link)
                        // Link is already included, skip
                        continue arrange_links;
                }
                // Link is not included, add it to sub-directory
                sub_dirs[dir].items.push({ link, text: get_title(link) });
                continue arrange_links;
            }
            // Link does not belong to any sub-directory
            items.push({ link, text: get_title(link) });
        }
    }
    // [4th scan] Remove empty sub-directories
    for (const el of items) {
        if (!el?.items?.length) {
            delete el.items;
            delete el.collapsed;
        }
    }
    // Return final result
    return items
}

for (const key in sidebar) {
    sidebar[key] = reform(sidebar[key], key);
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

export default sidebar;
