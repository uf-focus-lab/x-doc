/* ---------------------------------------------------------
 * Copyright (c) 2023 Yuxuan Zhang, web-dev@z-yx.cc
 * This source code is licensed under the MIT license.
 * You may find the full license in project root directory.
 * ------------------------------------------------------ */

import { resolve } from 'path';
import { readFileSync } from 'fs';

import { defineConfig as VitePressConfig } from 'vitepress';

import nav from './nav.js';
import sidebar from './sidebar.js';
import { splitIntoSections } from './search.js';

const base = process.cwd();

// https://vitepress.dev/reference/site-config
export default VitePressConfig({
    outDir: resolve(base, 'var', 'dist'),
    title: "Docs",
    description: "Modern looking documentation for X. Content ported from X.org (version 11, release 7.7).",
    metaChunk: true,
    head: [
        ['link', { rel: 'manifest', href: '/app.webmanifest' }],
    ],
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
        logoLink: '/',
        outline: 'deep',
        search: {
            provider: 'local',
            options: {
                miniSearch: {
                    splitIntoSections
                }
            }
        }
    },
    vite: {
        build: {
            chunkSizeWarningLimit: 4096,
        },
        plugins: [{
            load(id) {
                if (id === resolve(base, 'docs', 'index.md')) {
                    return readFileSync(resolve(base, 'index.md'), 'utf-8')
                }
            }
        }]
    }
})
