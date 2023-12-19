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
import breakdown from './breakdown-article.js';

const src_id = process.env.SRC_ID

const raw_list = readFileSync('raw.list', 'utf-8').split('\n').filter(Boolean);
const remap_list = readFileSync('remap.list', 'utf-8').split('\n').filter(Boolean);
const map = Object.fromEntries(raw_list.map((id, i) => [id, remap_list[i]]));

const out_id = sid => map[sid].replace(/\/$/, '/index');

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

function write_html_md(id, src, title) {
    write(id + '.src.html', src);
    write(id + '.md', [
        `---`,
        YAML.stringify({ title }).trim(),
        `---`,
        '',
        `<script setup>`,
        `import { onMounted, ref } from "vue";`,
        `const html = ref("");`,
        `onMounted(async () => {`,
        `    const raw = await import("/${id}.src.html?raw");`,
        `    html.value = raw?.default ?? "Error Loading Content";`,
        `});`,
        `</script>`,
        '',
        `<div v-html="html"></div>`,
    ].join('\n'));
}

// Remove components from document
const blacklist = ['.navheader', '.navfooter'];
for (const node of document.querySelectorAll(blacklist.join(','))) {
    node.parentElement.removeChild(node);
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
        // const code = document.createElement('code');
        // code.innerHTML = node.outerHTML;
        // node.parentNode.insertBefore(code, node);
        // node.parentNode.removeChild(node);
    } else if (tagName === 'table') {
        for (const attr of node.getAttributeNames()) {
            node.removeAttribute(attr);
        }
    }
    if (/^h\d$/.test(tagName) && node?.id) {
        ctx[tagName] = node.textContent.replace(/\s+/g, ' ').trim();
    }
    // Rewrite src links
    const src_attr = node.getAttribute('src');
    if (src_attr !== null) {
        if (src_attr.endsWith('/logo.png')) {
            node.setAttribute('src', '/logo.png');
        } else {
            const res = new URL(src_attr, src);
            node.setAttribute('src', res.href);
        }
    }
    // Rewrite data links
    const data_attr = node.getAttribute('data');
    if (tagName === 'object' && data_attr !== null) {
        const res = new URL(data_attr, src);
        node.setAttribute('data', res.href);
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
    if (typeof map[src_id] !== 'string') {
        node.setAttribute('disabled', '');
        node.setAttribute('href', url.href);
        continue;
    };
    // Rewrite href
    node.setAttribute('href', '/' + map[src_id]);
    // Add to index
    index.push({
        context: JSON.parse(JSON.stringify(ctx)),
        text: node.textContent.replace(/\s+/g, ' ').trim(),
        link: node.getAttribute('href')
    })
}
// Post processing
const [contents, indexes] = breakdown(map[src_id], document.body, write_html_md);
const content = contents.map(node => node.outerHTML).join('\n\n');

// Generate markdown loader
let title = document.title || ctx.h1 || ctx.h2 || src_id;

title = title.split(':')
    .map(s => s.trim())
    .filter(Boolean)
    .filter(s => !/^X11(R\d+(.\d+)?)?\s*Manual\s*Pages$/ig.test(s))
    .join(' - ');

write_html_md(out_id(src_id), content, title)

if (out_id(src_id).split('/').pop() === 'index')
    write(out_id(src_id) + '.json', JSON.stringify(indexes ?? index, null, 4));
