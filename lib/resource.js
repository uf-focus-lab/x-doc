/* ---------------------------------------------------------
 * Copyright (c) 2023 Yuxuan Zhang @ FOCUS Lab
 * This source code is licensed under the MIT license.
 * You may find the full license in project root directory.
 * ------------------------------------------------------ */

import { resolve, dirname } from 'path';
import { existsSync } from 'fs';
import { mkdir, appendFile, readFile, writeFile, open } from 'fs/promises';
// Cache directory
const cache_dir = resolve(process.env.PWD, ".cache/")
let flag_init = false;
// Cache subsystem to track unreachable links
class Unreachable {
    static #list = resolve(cache_dir, 'unreachable.txt');
    static #unreachable_alerts = []
    // Match existing entries in the list
    static async has(url) {
        if (!existsSync(this.#list))
            await appendFile(this.#list, '');
        const list = await open(this.#list)
        for await (const line of list.readLines()) {
            if (line.trim() === url.href) {
                return true;
            }
        }
        return false;
    }
    // Alert unreachable links only once
    static alert(url, reason = undefined) {
        if (this.#unreachable_alerts.includes(url.href)) return;
        console.error("[X]", "Unreachable :", url.href + reason);
        this.#unreachable_alerts.push(url.href);
    }
    // Add new entries to the list
    static async add(url) {
        if (!await this.has(url))
            await appendFile(this.#list, url.href + '\n');
    }
}
/**
 * Download file from url and save it to cache.
 * Load file from cache if it exists.
 * @param {URL} url 
 * @param {string} relative_path 
 * @returns {Promise<string>} loaded file content
 */
export default async function (url, relative_path) {
    if (!flag_init) {
        await mkdir(cache_dir, { recursive: true });
        flag_init = true;
    }
    if (existsSync(resolve(cache_dir, relative_path))) {
        console.log("[-]", "Cached    :", relative_path);
        return await readFile(resolve(cache_dir, relative_path), 'utf8');
    }
    if (await Unreachable.has(url)) {
        Unreachable.alert(url, " (from cache)");
        return;
    }
    const failed = [];
    for (let i = 0; i < 3; i++) {
        try {
            console.log("[ ]", "Downloading:", relative_path);
            const response = await fetch(url, { timeout: 1000 });
            if (!response.ok) {
                failed.push(`Bad status ${response.status}`);
                continue;
            }
            const html = await response.text();
            console.log("[+]", "Downloaded:", relative_path);
            const cache_path = resolve(cache_dir, relative_path);
            await mkdir(dirname(cache_path), { recursive: true });
            await writeFile(cache_path, html);
            return html;
        } catch (e) {
            failed.push(e.message);
        }
    }
    Unreachable.add(url);
    const msg = Object
        .entries(
            failed.reduce((d, r) => {
                d[r] = (d[r] ?? 0) + 1;
                return d;
            }, {})
        )
        .map(([k, v]) => `${k}(${v})`)
        .join(', ')
    console.error("[X]", "Unreachable :", url.href, msg, "(from network)");
}
