/* ---------------------------------------------------------
 * Copyright (c) 2023 Yuxuan Zhang @ FOCUS Lab
 * This source code is licensed under the MIT license.
 * You may find the full license in project root directory.
 * ------------------------------------------------------ */

import traverse, { ELEMENT_NODE } from "../../lib/traverse.js";

function* href_nodes(...nodes) {
    for (const node of traverse(...nodes)) {
        if (node.nodeType !== ELEMENT_NODE) continue;
        if (node.tagName !== 'A') continue;
        const href = node.getAttribute('href');
        if (!href?.startsWith('#')) continue;
        const id = href.slice(1);
        yield [node, id]
    }
}

function* ids(...nodes) {
    for (const node of traverse(...nodes)) {
        if (node.nodeType !== ELEMENT_NODE) continue;
        const id = node.id;
        if (id) yield id;
    }
}

function children(node) {
    while (true) {
        const { children } = node;
        if (children.length > 1) return [...children];
        if (children.length === 1) [node] = children;
        else return [node];
    }
}
/**
 * @param {HTMLElement} sec 
 */
function break_section(sec) {
    if (sec.children.length === 1 && /^[ou]l$/i.test(sec.children[0].tagName)) {
        const [ol] = sec.children;
        for (const node of ol.querySelectorAll('a[name]')) {
            const level = (() => {
                let l = 1, n = node.parentNode;
                while (n !== ol) {
                    n = n.parentNode;
                    l++;
                }
                return l;
            })()
            if (!node.id) node.setAttribute('id', node.getAttribute('name'));
            node.removeAttribute('name');
            // Create a new header tag to replace the anchor
            const h = sec.ownerDocument.createElement(`h${level}`);
            for (const attr of node.getAttributeNames())
                h.setAttribute(attr, node.getAttribute(attr));
            h.innerHTML = node.innerHTML;
            node.parentNode.replaceChild(h, node);
        }
        return ol.children;
    } else {
        return [sec];
    }
}
/**
 * Breakdown article into segments, save each segment as a file
 * @param {String} src_id 
 * @param {HTMLBodyElement} body
 * @param {(rel_path: String, data: String, title: String) => any} write
 * @returns {[Array<HTMLElement>, Array]} index_page elements
 */
export default function breakdown(src_id, body, write) {
    const elements = children(body)

    if (!src_id.endsWith('/')) return [elements];
    else {
        console.log("#", elements.length, src_id);
        const
            hash_map = {},
            index_page = [],
            segments = [];
        let flag_index = true;
        for (const el of elements) {
            if (el?.nodeType !== ELEMENT_NODE) {
                const skipped = el?.textContent?.trim();
                if (skipped)
                    throw new Error(
                        el?.constructor?.name, "skipped", "::", el?.textContent?.trim()
                    );
                continue;
            };
            flag_index &&= !/preface|sect(ion|\d+)|chapt(er)?\d/ig.test(el.className)
            if (flag_index) {
                for (const id of ids(el))
                    hash_map[id] = 'index';
                index_page.push(el);
            } else {
                for (const section of break_section(el)) {
                    for (const id of ids(section))
                        hash_map[id] = segments.length;
                    segments.push(section);
                }
            }
        }
        // Find names from segments
        const segNames = segments.map((seg, i) => {
            const idx = `${i + 1}`.padStart(2, '0')
            const title_node = seg.querySelector(
                'h1, h2, h3, h4, .title'
            );
            if (title_node) {
                const title = title_node.textContent
                    .trim()
                    .split('')
                    .filter(c => /^(\s|[a-z]|[0-9]|_|\-)$/ig.test(c))
                    .join('')
                    .slice(0, 64)
                    .replace(/\s+/g, '-');
                if (title) return [idx, title].join('-');
            }
            return idx;
        });
        // Rewrite hash links according to hash map
        for (const [node, id] of href_nodes(...index_page)) {
            const seg_id = hash_map[id];
            if (!(seg_id in segNames)) continue;
            node.setAttribute('href', [segNames[seg_id], id].join('#'));
        }
        for (const [node, id] of href_nodes(...segments)) {
            const seg_id = hash_map[id];
            if (seg_id === 'index')
                node.setAttribute('href', ['./', id].join('#'));
            else if (seg_id in segNames)
                node.setAttribute('href', [segNames[seg_id], id].join('#'));
        }
        // Save all segments
        for (const [i, seg] of segments.entries()) {
            const seg_id = segNames[i];
            console.log("#", "|", '/'.padStart(src_id.length) + seg_id);
            write(src_id + seg_id, seg.innerHTML, seg_id);
        }
        // Return index_page elements
        return [index_page, segNames.map(n => ({ link: src_id + n, text: n.split('-').slice(1).join(' ') }))];
    }
}
