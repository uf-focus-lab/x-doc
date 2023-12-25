/* ---------------------------------------------------------
 * Copyright (c) 2023 Yuxuan Zhang, web-dev@z-yx.cc
 * This source code is licensed under the MIT license.
 * You may find the full license in project root directory.
 * ------------------------------------------------------ */

import { resolve } from 'path';
import { existsSync, readFileSync, copyFileSync } from 'fs';

import { defineConfig as VitePressConfig } from 'vitepress';

import nav from './nav.js';
import sidebar from './sidebar.js';
import { splitIntoSections } from './search.js';

const base = process.cwd();

if (existsSync(resolve(base, 'docs', 'index.md'))) {
    copyFileSync(resolve(base, 'docs', 'index.md'), resolve(base, 'docs', 'README.md'));
}

// https://vitepress.dev/reference/site-config
export default VitePressConfig({
    sitemap: {
        hostname: 'https://x.z-yx.cc/'
    },
    outDir: resolve(base, 'var', 'dist'),
    title: "Docs",
    description: "Modern looking documentation for X. Content ported from X.org (version 11, release 7.7).",
    metaChunk: true,
    head: [
        ['link', { rel: 'manifest', href: '/app.webmanifest' }],
        ['link', { rel: 'icon', sizes: '512x512', href: '/icon.round.png' }],
        ['link', { rel: 'icon', sizes: '256x256', href: '/icon.round.256.png' }],
        ['link', { rel: 'icon', sizes: '128x128', href: '/icon.round.128.png' }],
        ['link', { rel: 'icon', sizes: '64x64', href: '/icon.round.64.png' }],
        // iOS web app tweaks
        ['link', { rel: 'apple-touch-icon', href: '/icon.png' }],
        ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
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
        logo: '/x.svg',
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
