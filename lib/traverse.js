/* ---------------------------------------------------------
 * Copyright (c) 2023 Yuxuan Zhang, web-dev@z-yx.cc
 * This source code is licensed under the MIT license.
 * You may find the full license in project root directory.
 * ------------------------------------------------------ */

// Node type constants
export const
    // An Element node like <p> or <div>.
    ELEMENT_NODE = 1,
    // An Attribute of an Element.
    ATTRIBUTE_NODE = 2,
    // The actual Text inside an Element or Attr.
    TEXT_NODE = 3,
    // A CDATASection, such as <!CDATA[[ … ]]>
    CDATA_SECTION_NODE = 4,
    // A ProcessingInstruction of an XML document, such as <?xml-stylesheet … ?>.
    PROCESSING_INSTRUCTION_NODE = 7,
    // A Comment node, such as <!-- … -->.
    COMMENT_NODE = 8,
    // A Document node.
    DOCUMENT_NODE = 9,
    // A DocumentType node, such as <!DOCTYPE html>.
    DOCUMENT_TYPE_NODE = 10,
    // A DocumentFragment node.
    DOCUMENT_FRAGMENT_NODE = 11;

/**
 * Traverse the DOM tree, and yield each node in the order they appear.
 * Parent nodes are yielded before their children.
 * @param {Element[]} nodes 
 * @returns {Generator<Element, void, void>}
 */
export default function* traverse(...nodes) {
    for (const node of nodes) {
        yield node;
        for (const child of node?.childNodes ?? []) {
            yield* traverse(child);
        }
    }
}

/**
 * Traverse the DOM tree, and yield each node in the order they appear.
 * Parent nodes are yielded before their children.
 * @param {Element[]} nodes 
 * @returns {Generator<[Element, (skip?:Boolean) => any], void, void>}
 */
export function* skippableTraverse(...nodes) {
    for (const node of nodes) {
        let skip = false;
        yield [node, (f = true) => skip = f];
        if (skip) continue;
        for (const child of node?.childNodes ?? []) {
            yield* skippableTraverse(child);
        }
    }
}
