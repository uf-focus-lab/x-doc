/* ---------------------------------------------------------
 * Copyright (c) 2023 Yuxuan Zhang, web-dev@z-yx.cc
 * This source code is licensed under the MIT license.
 * You may find the full license in project root directory.
 * ------------------------------------------------------ */

import { Worker, isMainThread, parentPort } from 'worker_threads';

async function worker() {
    const { existsSync, readFileSync } = await import('node:fs');
    const { JSDOM } = await import('jsdom');
    const {
        skippableTraverse: traverse,
        ELEMENT_NODE,
        TEXT_NODE
    } = await import('../lib/traverse.js');
    // Wait for message
    const path = await new Promise(res => parentPort.once('message', res));
    // Read file
    if (!existsSync(path)) return;
    const html = readFileSync(
        path.replace(/(\.md)?$/, '.src.html'), 'utf-8'
    );
    const dom = JSDOM.fragment(html);
    /**
     * Stack of title hierarchy for current working section
     * @type {Array<{level: number, text: string}>}
     */
    const titleStack = [];
    // Set of all used ids
    const existingIdSet = new Set();
    // Current working section
    let section = { text: '', titles: [''] };
    function submit() {
        section.text = section.text
            .replace(/\W+/sg, ' ')
            .trim();
        if (section.text || section.anchor) {
            parentPort.postMessage(section);
        }
    }
    // Traverse the DOM
    for (const [el, skipChildren] of traverse(dom)) {
        if (el.nodeType === ELEMENT_NODE) {
            if (!/^H\d+$/i.test(el.tagName)) continue;
            if (!el.hasAttribute('id')) continue;
            const id = el.getAttribute('id');
            if (existingIdSet.has(id)) {
                const rel_path = path.slice(process.cwd().length + 1);
                console.warn(
                    `\x1b[2K\r⚠️  Duplicate id ${id} in ${rel_path}`
                );
                continue;
            }
            existingIdSet.add(id);
            // Submit previous section
            submit();
            // Pop adjacent titles depending on level
            const level = parseInt(el.tagName.slice(1));
            while (titleStack.length > 0) {
                if (titleStack.at(-1).level >= level)
                    titleStack.pop();
                else break;
            }
            titleStack.push({ level, text: el.textContent });
            // Create new section
            section = {
                text: '',
                anchor: el.getAttribute('id'),
                titles: titleStack.map(_ => _.text)
            };
            skipChildren();
        } else if (el.nodeType === TEXT_NODE) {
            // Collect text content
            section.text += el.textContent
        }
    }
    // Submit last section
    submit();
}

if (!isMainThread) worker();

// ====================== MAIN THREAD ======================

import { fileURLToPath } from 'node:url';
import { createAsyncGenerator } from '../lib/utility.js';

export function splitIntoSections(path) {
    const worker = new Worker(fileURLToPath(import.meta.url));

    const [generator, handle] = createAsyncGenerator();
    worker.addListener('message', handle.yield);
    worker.addListener('error', handle.throw);
    worker.addListener('exit', (code) => {
        worker.removeAllListeners()
        if (code !== 0)
            handle.throw(new Error(`Worker exit code ${code}`));
        else
            handle.return();
    });
    // Send path to worker thread
    worker.postMessage(path);
    // Return the generator
    return generator;
}
