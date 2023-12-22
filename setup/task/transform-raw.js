/* ---------------------------------------------------------
 * Copyright (c) 2023 Yuxuan Zhang, web-dev@z-yx.cc
 * This source code is licensed under the MIT license.
 * You may find the full license in project root directory.
 * ------------------------------------------------------ */

import { JSDOM } from 'jsdom'
import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname } from 'path'

import YAML from 'yaml';

import { skippableTraverse as traverse } from '../../lib/traverse.js'
import { ELEMENT_NODE } from '../../lib/transform.js'
import { baseURL } from '../../lib/env.js'

import { source_id } from '../fetch-raw.js';
import breakdown from './breakdown-article.js';
import transformCode, { isCodeElement } from './code-block.js';

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
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, data);
}

function write_html_md(id, src, title) {
    write(id + '.src.html', src);
    write(id + '.md', [
        `---`,
        YAML.stringify({ title, sid: id }).trim(),
        `---`,
        '',
        `<script setup>`,
        `import html from "/${id}.src.html?raw";`,
        `</script>`,
        '',
        `<div v-html="html"></div>`,
    ].join('\n'));
}

/**
 * Use given URL as fallback href, protocol stripped.
 * @param {HTMLElement} el
 * @param {URL} url 
 */
function link_extern(el, url, attr = 'href') {
    if (el.tagName === 'A') {
        el.classList.add('x-external-link');
        el.setAttribute('target', '_blank');
    }
    el.setAttribute(attr, url.href.replace(/^\w+\:/i, ''));
}

// Remove components from document
const blacklist = ['.navheader', '.navfooter'];
for (const node of document.querySelectorAll(blacklist.join(','))) {
    node.parentElement.removeChild(node);
}

// Hoist nested anchors
// e.g.
// Before: <h1><a id="hello-world"></a>Hello, world!</h1>
// After:  <h1 id="hello-world"><a></a>Hello, world!</h1>
for (const node of document.querySelectorAll("a[id]:first-child")) {
    // Skip if parent is already an anchor
    if (node?.parentElement?.id) continue;
    node.parentElement.id = node.id;
    node.removeAttribute('id');
}

// Transform all links
for (const [node, skip_children] of traverse(document.body)) {
    if (node.nodeType !== ELEMENT_NODE) continue;
    const tagName = node.tagName;
    // Remove all irrelevant tags
    if (disallowed_tags.includes(tagName)) {
        node.parentElement.removeChild(node);
        continue;
    }
    if (tagName === 'PRE' || isCodeElement(node)) {
        await transformCode(node);
        skip_children();
        continue;
    }
    if (tagName === 'TABLE') {
        for (const attr of node.getAttributeNames()) {
            node.removeAttribute(attr);
        }
    }
    if (/^H\d$/i.test(tagName) && node?.id) {
        ctx[tagName] = node.textContent.replace(/\s+/g, ' ').trim();
    }
    // Rewrite src links
    const src_attr = node.getAttribute('src');
    if (src_attr !== null) {
        if (src_attr.endsWith('/logo.png')) {
            node.setAttribute('src', '/logo.png');
        } else {
            const res = new URL(src_attr, src);
            link_extern(node, res, 'src');
        }
    }
    // Rewrite data links
    const data_attr = node.getAttribute('data');
    if (tagName === 'OBJECT' && data_attr !== null) {
        const res = new URL(data_attr, src);
        link_extern(node, res, 'data');
    }
    // Transform link href
    if (tagName !== 'A') continue;
    // Check for logo links, use doc root
    if (node.getAttribute('rel') === "home") {
        node.setAttribute('href', '/');
        continue;
    }
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
        node.classList.add('x-external-link');
        node.setAttribute('target', '_blank');
        link_extern(node, url);
        continue;
    } else if (typeof map[src_id] !== 'string') {
        node.classList.add('x-dead-link');
        link_extern(node, url);
        continue;
    }
    // Rewrite href to doc internal link
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
    write(out_id(src_id) + '.json', JSON.stringify(indexes || index, null, 4));
