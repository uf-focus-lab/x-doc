/* ---------------------------------------------------------
 * Copyright (c) 2023 Yuxuan Zhang @ FOCUS Lab
 * This source code is licensed under the MIT license.
 * You may find the full license in project root directory.
 * ------------------------------------------------------ */

import { fileURLToPath } from 'url';
import { resolve, dirname } from 'node:path';
import { readFileSync } from 'fs';

export const PROJECT_ROOT = resolve(
    dirname(fileURLToPath(import.meta.url)), '..'
);

export const PACKAGE = JSON.parse(
    readFileSync(resolve(PROJECT_ROOT, 'package.json'), 'utf-8')
);

if (!("origin" in PACKAGE))
    throw new Error('package.json missing required property "origin"');

export const baseURL = new URL(PACKAGE["origin"]);
