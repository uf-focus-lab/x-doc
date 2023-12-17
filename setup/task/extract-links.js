/* ---------------------------------------------------------
 * Copyright (c) 2023 Yuxuan Zhang @ FOCUS Lab
 * This source code is licensed under the MIT license.
 * You may find the full license in project root directory.
 * ------------------------------------------------------ */

import { JSDOM } from 'jsdom'

import traverse from '../../lib/traverse.js'
import { ELEMENT_NODE } from '../../lib/transform.js'

import { source_id } from '../fetch_raw.js';

const src = new URL(process.env.SRC)
const { window: { document } } = await JSDOM.fromFile(process.env.FILE);

// Transform all links
for (const node of traverse(document.body)) {
    if (node.nodeType !== ELEMENT_NODE) continue;
    // Check for links to be transformed
    const href = node.getAttribute('href');
    if (href === null || href.startsWith('#')) continue;
    // Create URL from href
    const url = new URL(node.getAttribute('href'), src);
    const src_id = source_id(url)
    if (src_id !== undefined)
        process.stdout.write(url.href + '\n')
}
