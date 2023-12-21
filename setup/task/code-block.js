/* ---------------------------------------------------------
 * Copyright (c) 2023 Yuxuan Zhang, web-dev@z-yx.cc
 * This source code is licensed under the MIT license.
 * You may find the full license in project root directory.
 * ------------------------------------------------------ */

import { JSDOM } from 'jsdom';
import shiki from 'shiki';
import detectLang from 'lang-detector';

import { TEXT_NODE } from '../../lib/traverse.js';

// Lazy loaded highlighter
/** @type {shiki.Highlighter} */
let __hl__;
const themes = ['light-plus', 'dark-plus'];
async function hl() {
    if (!__hl__) __hl__ = await shiki.getHighlighter({
        themes, langs: ['c++']
    });
    return __hl__;
}

/**
 * @param {HTMLElement} node
 * @returns 
 */
export function isCodeElement(node) {
    const classList = ['code', 'funcsynopsis']
    for (const cls of node.classList) {
        if (classList.includes(cls)) return true;
    }
    return false;
}
/**
 * @param {HTMLPreElement} node
 */
export default async function transformCode(node) {
    const text = node.textContent
        .replace(/^(\s*\n)+/s, '')
        .replace(/(\n\s*)+$/s, '');
    const isMultiLineCode =
        text.includes('\n') ||
        !/^(span|a|p|label|td)$/ig.test(node.parentElement.tagName);
    if (!isMultiLineCode) {
        // Inline code block
        node.innerHTML = `<code>${node.innerHTML}</code>`;
        return;
    } else {
        // Multi-line code block
        const lang = detectLang(text);
        // Add a div wrapper
        const div = node.ownerDocument.createElement('div');
        if (/^C(\+\+|\#)?$/i.test(lang)) {
            div.classList.add('language-c');
            div.classList.add('dual-scheme');
            // Preserve all anchors
            for (const a of node.querySelectorAll('a[id], a[name]')) {
                a.innerHTML = '';
                div.appendChild(a);
            }
            // Use C++ syntax highlighting
            const highlighter = await hl();
            function highlight(text, theme) {
                const src = highlighter.codeToHtml(
                    text, { lang: 'c++', defaultColor: false, theme }
                );
                const node = JSDOM.fragment(src).querySelector('pre');
                node.removeAttribute('style');
                return node;
            }
            const [node_light, node_dark] = themes.map(t => highlight(text, t));
            node_light.classList.add('scheme-light');
            node_dark.classList.add('scheme-dark');
            div.appendChild(node_light);
            div.appendChild(node_dark);
        } else {
            div.classList.add('language-plain-text');
            for (const child of [node.firstChild, node.lastChild])
                if (child?.nodeType === TEXT_NODE && child?.textContent?.trim() === '')
                    node.removeChild(child);
            div.innerHTML = `<pre><code>${node.innerHTML}<code></pre>`;
        }
        // Replace <pre> with <div>
        node.parentNode.replaceChild(div, node);
    }
}
