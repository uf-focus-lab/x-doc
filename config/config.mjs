/* ---------------------------------------------------------
 * Copyright (c) 2023 Yuxuan Zhang @ FOCUS Lab
 * This source code is licensed under the MIT license.
 * You may find the full license in project root directory.
 * ------------------------------------------------------ */

import { defineConfig } from 'vitepress';
import { nav } from './nav.js';
import { sidebar } from './sidebar.js';
// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "X-DOC",
    description: "Modern looking documentation for X. Content ported from X.org (version 11, release 7.7).",
    // https://vitepress.dev/reference/default-theme-config
    themeConfig: {
        nav,
        sidebar,
        socialLinks: [
            { icon: 'github', link: 'https://github.com/zhangyx-lab/x-org-docs' }
        ],
        logo: '/logo.png',
        logoLink: '/',
    },
})
