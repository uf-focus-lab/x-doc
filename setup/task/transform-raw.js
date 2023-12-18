/* ---------------------------------------------------------
 * Copyright (c) 2023 Yuxuan Zhang @ FOCUS Lab
 * This source code is licensed under the MIT license.
 * You may find the full license in project root directory.
 * ------------------------------------------------------ */

import { JSDOM } from 'jsdom'
import { readFileSync, writeFileSync } from 'fs'

import YAML from 'yaml';

import traverse from '../../lib/traverse.js'
import { ELEMENT_NODE } from '../../lib/transform.js'
import { baseURL } from '../../lib/env.js'

import { source_id } from '../fetch-raw.js';

const src_id = process.env.SRC_ID
const id_list = readFileSync(process.env.LIST, 'utf-8').split('\n').filter(Boolean);

const src = new URL(baseURL.href + src_id + '.html')

const { window: { document } } = await JSDOM.fromFile(src_id + '.raw.html')

const index = [], ctx = {};

// List of all disallowed tag names
const disallowed_tags = [
    // Root HTML tags
    'head',
    // Header only tags
    'style', 'script', 'link', 'meta',
    // Self closing tags
    'br', 'hr'
];

function write(file, data) {
    console.log(file);
    writeFileSync(file, data);
}

// Transform all links
for (const node of traverse(document.body)) {
    if (node.nodeType !== ELEMENT_NODE) continue;
    const tagName = node.tagName.toLowerCase();
    // Remove all irrelevant tags
    if (disallowed_tags.includes(tagName)) {
        node.parentElement.removeChild(node);
        continue;
    } else if (tagName === 'pre') {
        const code = document.createElement('code');
        code.innerHTML = node.outerHTML;
        node.parentNode.insertBefore(code, node);
        node.parentNode.removeChild(node);
    }
    if (/^h\d$/.test(tagName) && node?.id) {
        ctx[tagName] = node.textContent.replace(/\s+/g, ' ').trim();
    }
    // Rewrite src links
    const src_attr = node.getAttribute('src');
    if (src_attr !== null && src_attr !== '/logo.png') {
        const res = new URL(src_attr, src);
        node.setAttribute('src', res.href);
    }
    // Transform link href
    if (tagName !== 'a') continue;
    // Check for logo links
    if (node.getAttribute('rel') === "home")
        continue;
    // Extract href attribute
    const href = node.getAttribute('href');
    if (href === null || href.startsWith('#')) continue;
    // Create URL from href
    const url = new URL(node.getAttribute('href'), src);
    // Check for doc root link
    if (url.href === baseURL.href) {
        node.setAttribute('href', '/');
        continue;
    }
    // Check for src_id eligibility
    const src_id = source_id(url);
    if (src_id === undefined) {
        node.setAttribute('href', url.href);
        continue;
    };
    if (!id_list.includes(src_id)) {
        node.setAttribute('disabled', '');
        node.setAttribute('href', url.href);
        continue;
    };
    // Rewrite href
    node.setAttribute('href', '/' + src_id);
    // Add to index
    index.push({
        context: JSON.parse(JSON.stringify(ctx)),
        text: node.textContent.replace(/\s+/g, ' ').trim(),
        link: node.getAttribute('href')
    })
}
// Find real root node
let root_node = document.body;
while (root_node.childNodes.length === 1)
    root_node = root_node.childNodes[0];
// Post processing
write(src_id + '.src.html', root_node.innerHTML);
// Generate json index
write(src_id + '.json', JSON.stringify(index, null, 4));
// Generate markdown loader
let title = document.title || ctx.h1 || src_id;

title = title.split(':')
    .map(s => s.trim())
    .filter(Boolean)
    .filter(s => !/^X11(R\d+(.\d+)?)?\s*Manual\s*Pages$/ig.test(s))
    .join(' - ');

write(src_id + '.md', [
    `---`,
    YAML.stringify({ title }).trim(),
    `---`,
    '',
    `<script setup>`,
    `import html from "/${src_id}.src.html?raw";`,
    `</script>`,
    '',
    `<div v-html="html"></div>`,
    '',
].join('\n'));
