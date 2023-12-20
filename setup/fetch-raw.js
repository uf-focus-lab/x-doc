/* ---------------------------------------------------------
 * Copyright (c) 2023 Yuxuan Zhang, web-dev@z-yx.cc
 * This source code is licensed under the MIT license.
 * You may find the full license in project root directory.
 * ------------------------------------------------------ */

import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";
import { exec } from "node:child_process";

import { baseURL } from '../lib/env.js'
import cached_fetch from '../lib/resource.js';
import writeFile from '../lib/output.js';
import PoolPromise, { queue } from '../lib/pool.js'

const dir = dirname(fileURLToPath(import.meta.url))
const __extract_links__ = resolve(dir, 'task', 'extract-links.js')

// List of already downloaded resources
const tree = {};
export async function all_files() {
    const tasks = await Promise.all(Object.values(tree));
    return tasks.filter(e => e !== undefined);
}
/**
 * Function to get src_id from a given url
 * @param {URL} url 
 * @returns {String} relative path of the url as ID (if possible)
 */
export function relative_path(url) {
    if (url.host !== baseURL.host) return;
    if (!url.pathname.startsWith(baseURL.pathname)) return;
    return url.pathname.slice(baseURL.pathname.length) || "index.html";
}

/**
 * Function to get src_id from a given url
 * @param {String | URL} rel_path
 * @returns {String} relative path of the url as ID (if possible)
 */
export function source_id(arg) {
    const rel_path = (arg instanceof URL)
        ? relative_path(arg)
        : arg;
    if (!/\.x?html$/i.test(rel_path))
        return;
    return rel_path.replace(/\.x?html$/ig, '');
}

/**
 * Function to query the state of a resource id
 * @param {URL} url 
 * @returns {String} relative path of the url as ID (if possible)
 */
export async function source(url) {
    const rel_path = relative_path(url)
    const src_id = source_id(rel_path);
    if (src_id === undefined) return;
    // Download and transform document (if not already done)
    if (!(src_id in tree)) {
        tree[src_id] = (async () => {
            const html = await cached_fetch(url, rel_path);
            if (html !== undefined) {
                // Remove XHTML preambles
                const src = html.replace(/^.*\<\s*html/si, '<html');
                const out_path = await writeFile(src_id + '.raw.html', src);
                await search_links(out_path, src_id, url);
                tree[src_id] = src_id;
            } else {
                tree[src_id] = undefined;
            }
            if (tree[src_id] instanceof Promise)
                throw new Error("Unmet dependency", typeof html, src_id)
            return tree[src_id];
        })();
        await tree[src_id];
    }
}
// Process html document
async function search_links(html_path, src_id, src) {
    // const size = Math.round(html.length / 1024)
    // console.log("[ ] Search links:", src_id, `(${size}K)`)
    // Normalize source url
    if (src.pathname.endsWith('/')) {
        src = new URL(src.href + 'index.html');
    }
    const links = await PoolPromise((res, rej) => {
        exec(
            [process.argv[0], __extract_links__].join(' '),
            {
                cwd: resolve('docs'),
                env: {
                    SRC: src.href,
                    FILE: html_path
                }
            },
            (err, stdout, stderr) => {
                if (err) rej(err)
                else if (stderr) rej(new Error(stderr))
                else res(stdout.toString().split('\n').filter(Boolean))
            });
    })
    const prog = `(${queue.length.toString().padStart(4, ' ')} pending)`;
    console.log("[~] Found links :", prog, src_id, links.length);
    await Promise.all(links.map(l => source(new URL(l, baseURL))));
}
