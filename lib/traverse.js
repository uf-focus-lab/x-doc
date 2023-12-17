/* ---------------------------------------------------------
 * Copyright (c) 2023 Yuxuan Zhang @ FOCUS Lab
 * This source code is licensed under the MIT license.
 * You may find the full license in project root directory.
 * ------------------------------------------------------ */

/**
 * Traverse the DOM tree, and yield each node in the order they appear.
 * Parent nodes are yielded before their children.
 * @param {Element} node 
 * @returns {Generator<Element, void, void>}
 */
export default function* traverse(node) {
    yield node;
    for (const child of node?.childNodes ?? []) {
        yield* traverse(child);
    }
}
