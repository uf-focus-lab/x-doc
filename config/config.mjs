/* ---------------------------------------------------------
 * Copyright (c) 2023 Yuxuan Zhang, web-dev@z-yx.cc
 * This source code is licensed under the MIT license.
 * You may find the full license in project root directory.
 * ------------------------------------------------------ */

import { resolve } from 'path';

import { defineConfig as VitePressConfig } from 'vitepress';

import nav from './nav.js';
import sidebar from './sidebar.js';

const base = process.cwd();

// https://vitepress.dev/reference/site-config
export default VitePressConfig({
    outDir: resolve(base, 'var', 'dist'),
    title: "Docs",
    description: "Modern looking documentation for X. Content ported from X.org (version 11, release 7.7).",
    metaChunk: true,
    // https://vitepress.dev/reference/default-theme-config
    themeConfig: {
        nav,
        sidebar,
        socialLinks: [
            {
                icon: 'github',
                link: 'https://github.com/zhangyx-lab/x-doc'
            }
        ],
        logo: '/x.png',
        logoLink: '/'
    }
})
