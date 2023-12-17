/* ---------------------------------------------------------
 * Copyright (c) 2023 Yuxuan Zhang @ FOCUS Lab
 * This source code is licensed under the MIT license.
 * You may find the full license in project root directory.
 * ------------------------------------------------------ */

import { fileURLToPath } from 'url';
import { resolve, dirname } from 'node:path';
import { readFileSync } from 'fs';

export const project_root = resolve(
    dirname(fileURLToPath(import.meta.url)), '..'
);

export const baseURL = new URL(
    readFileSync(resolve(project_root, 'base.url'), 'utf-8').trim()
);
