/* ---------------------------------------------------------
 * Copyright (c) 2023 Yuxuan Zhang @ FOCUS Lab
 * This source code is licensed under the MIT license.
 * You may find the full license in project root directory.
 * ------------------------------------------------------ */

import { readFileSync } from 'fs';

import fm from 'front-matter';

export default function get_title(id) {
    const md_src = "docs/" + id
        .replace(/^\/+/gi, '')
        .replace(/\/$/, '/index') + ".md";
    try {
        const file = fm(readFileSync(md_src, 'utf8'));
        if (file?.attributes?.title)
            return file?.attributes?.title
    } catch (_) { }
    return id.replace('/', '-');
}
