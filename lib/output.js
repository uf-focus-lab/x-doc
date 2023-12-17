/* ---------------------------------------------------------
 * Copyright (c) 2023 Yuxuan Zhang @ FOCUS Lab
 * This source code is licensed under the MIT license.
 * You may find the full license in project root directory.
 * ------------------------------------------------------ */

import { accessSync } from 'fs';
import { writeFile, mkdir, lstat, symlink, readdir, rm } from 'fs/promises';
import { resolve, dirname } from 'path';
export const base = resolve(process.env.PWD, "docs") + '/';
function rel(path) {
    const pwd = process.env.PWD.replace(/\/*$/, '/');
    if (path.startsWith(pwd))
        return path.slice(pwd.length);
    else
        return path;
}
// Create a index of all currently tracked files
async function* walk(path, allow_symlink = false) {
    const ls = await lstat(path);
    if (ls.isSymbolicLink() && !allow_symlink) {
        return;
    } else if (ls.isFile()) {
        yield path;
    } else if (ls.isDirectory()) {
        if (path.endsWith('/'))
            yield path;
        else
            yield path + '/';
        for (const el of await readdir(path)) {
            yield* walk(resolve(path, el));
        }
    }
}
// List of all existing files and directories
const outdated = new Set();

export async function init_dir() {
    // Create dst directory if it does not exist
    await mkdir(base, { recursive: true });
    // Create symbolic links if they do not exist
    const vitepress = resolve(base, '.vitepress');
    try { accessSync(vitepress); } catch (_) {
        symlink('../config', vitepress, 'dir');
    }
    const public_dir = resolve(base, 'public');
    try { accessSync(public_dir); } catch (_) {
        symlink('../public', public_dir, 'dir');
    }
    for await (const path of walk(base, true)) {
        if (path === base)
            continue;
        else if (path.startsWith(base)) {
            outdated.add(path);
        } else {
            throw new Error(`Unexpected file: ${path}`);
        }
    }
}

const promises = []

export function renew(rel_path, log = false) {
    const path = resolve(base, rel_path.replace(/^\/+/gi, ''));
    // Update outdated list
    outdated.forEach(p => {
        if (path.startsWith(p))
            outdated.delete(p);
    });
    // Log upon request
    if (log)
        console.log("[W]", "Written     :", 'docs/' + rel_path);
    // Return absolute path
    return path;
}

export default async function outputWriteFile(rel_path, content) {
    // Update outdated list
    const path = renew(rel_path, true);
    // Check pseudo write
    if (content !== undefined) {
        // Create directory
        await mkdir(dirname(path), { recursive: true });
        // Write file
        await writeFile(path, content);
    }
    return path;
}

export async function cleanup() {
    await Promise.all(promises);
    const list = [];
    // Merge outdated list (merge directories/files)
    for (const path of outdated) {
        let flag = true;
        for (const i in list) {
            if (list[i].startsWith(path)) {
                list[i] = path;
                flag = false;
                break;
            } else if (path.startsWith(list[i])) {
                flag = false;
                break;
            }
        }
        if (flag)
            list.push(path);
    }
    // Remove outdated files and directories
    console.log(["To be removed:", ...list.map(rel)].join('\n\t'));
    for (const path of list) {
        rm(path, { recursive: true });
    }
}
