var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// lib/traverse.js
var traverse_exports = {};
__export(traverse_exports, {
  ATTRIBUTE_NODE: () => ATTRIBUTE_NODE,
  CDATA_SECTION_NODE: () => CDATA_SECTION_NODE,
  COMMENT_NODE: () => COMMENT_NODE,
  DOCUMENT_FRAGMENT_NODE: () => DOCUMENT_FRAGMENT_NODE,
  DOCUMENT_NODE: () => DOCUMENT_NODE,
  DOCUMENT_TYPE_NODE: () => DOCUMENT_TYPE_NODE,
  ELEMENT_NODE: () => ELEMENT_NODE,
  PROCESSING_INSTRUCTION_NODE: () => PROCESSING_INSTRUCTION_NODE,
  TEXT_NODE: () => TEXT_NODE,
  default: () => traverse,
  skippableTraverse: () => skippableTraverse
});
function* traverse(...nodes) {
  for (const node of nodes) {
    yield node;
    for (const child of node?.childNodes ?? []) {
      yield* traverse(child);
    }
  }
}
function* skippableTraverse(...nodes) {
  for (const node of nodes) {
    let skip = false;
    yield [node, (f = true) => skip = f];
    if (skip)
      continue;
    for (const child of node?.childNodes ?? []) {
      yield* skippableTraverse(child);
    }
  }
}
var ELEMENT_NODE, ATTRIBUTE_NODE, TEXT_NODE, CDATA_SECTION_NODE, PROCESSING_INSTRUCTION_NODE, COMMENT_NODE, DOCUMENT_NODE, DOCUMENT_TYPE_NODE, DOCUMENT_FRAGMENT_NODE;
var init_traverse = __esm({
  "lib/traverse.js"() {
    ELEMENT_NODE = 1;
    ATTRIBUTE_NODE = 2;
    TEXT_NODE = 3;
    CDATA_SECTION_NODE = 4;
    PROCESSING_INSTRUCTION_NODE = 7;
    COMMENT_NODE = 8;
    DOCUMENT_NODE = 9;
    DOCUMENT_TYPE_NODE = 10;
    DOCUMENT_FRAGMENT_NODE = 11;
  }
});

// config/config.mjs
import { resolve as resolve3 } from "path";
import { existsSync as existsSync2, readFileSync as readFileSync4, copyFileSync } from "fs";
import { defineConfig as VitePressConfig } from "file:///Users/Yuxuan/Lab/vitepress/dist/node/index.js";

// config/nav.js
import { readFileSync as readFileSync2, writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";

// config/get-title.js
import { readFileSync } from "fs";
import fm from "file:///Users/Yuxuan/Lab/xorg-doc/node_modules/front-matter/index.js";
function get_title(id) {
  const md_src = "docs/" + id.replace(/^\/+/gi, "").replace(/\/$/, "/index") + ".md";
  try {
    const file = fm(readFileSync(md_src, "utf8"));
    if (file?.attributes?.title)
      return file?.attributes?.title;
  } catch (_) {
  }
  return id.replace("/", "-");
}

// config/nav.js
var doc_root = resolve(process.env.PWD, "docs");
var index = readFileSync2(resolve(doc_root, "index.json"), "utf8");
var nav = [];
var ctx;
for (const { context = {}, link = "" } of JSON.parse(index)) {
  let { H2 = "About", H3 } = context;
  H2 = H2.replace(/\:$/, "");
  if (H2 !== ctx?.text) {
    ctx = { text: H2, items: [], sub_dirs: {} };
    nav.push(ctx);
  }
  let { items } = ctx;
  if (H3 !== void 0) {
    H3 = H3.replace(/\:$/, "");
    if (!ctx.sub_dirs[H3]) {
      ctx.sub_dirs[H3] = { text: H3, items: [] };
      ctx.items.push(ctx.sub_dirs[H3]);
    }
    items = ctx.sub_dirs[H3].items;
  }
  items.push({ text: get_title(link), link });
}
for (const el of nav) {
  delete el.sub_dirs;
}
try {
  mkdirSync("var", { recursive: true });
  writeFileSync(
    resolve("var", "nav.json"),
    JSON.stringify(nav, null, 4)
  );
} catch (e) {
  console.error(e);
}
var nav_default = nav;

// config/sidebar.js
import { readFileSync as readFileSync3, writeFileSync as writeFileSync2, mkdirSync as mkdirSync2, existsSync } from "fs";
import { resolve as resolve2 } from "path";

// lib/utility.js
function compare_path(_a, _b) {
  const a = _a.split("/"), b = _b.split("/");
  while (a.length && b.length) {
    const [x, y] = [a.shift(), b.shift()];
    if (x === y)
      continue;
    if (x === "index")
      return -1;
    if (y === "index")
      return 1;
    return 0;
  }
}
function deferPromise() {
  let resolve4, reject;
  const promise = new Promise((res, rej) => {
    resolve4 = res;
    reject = rej;
  });
  return { promise, resolve: resolve4, reject };
}
var AsyncGenerator = class {
  [Symbol.asyncIterator]() {
    return this;
  }
  // =================== Receiver ===================
  #data_subscribers = [];
  next() {
    const { promise, resolve: resolve4, reject } = deferPromise();
    this.#data_subscribers.push({ resolve: resolve4, reject });
    return promise;
  }
  #return_subscribers = [];
  async return(value) {
  }
  // =================== Generator ===================
};

// config/sidebar.js
var doc_root2 = resolve2(process.env.PWD, "docs");
var list = readFileSync3(resolve2(doc_root2, "remap.list"), "utf8").split("\n").filter(Boolean).map((l) => l.trim());
var sidebar = list.reduce((dict, src_id) => {
  const [dir, ...paths] = src_id.split("/");
  if (paths.length === 0) {
    dict["/"].push("/" + src_id);
  } else {
    const key = "/" + (() => {
      if (dir === "man" && paths.length > 1)
        return [dir, paths.shift()].join("/");
      else
        return dir;
    })() + "/";
    if (!(key in dict))
      dict[key] = [];
    dict[key].push("/" + src_id);
  }
  return dict;
}, { "/": [] });
function reform(arr, key) {
  const dirs = arr.filter((link) => link.endsWith("/")).sort(compare_path).reverse();
  const sub_dirs = {};
  for (const dir of dirs) {
    const json = resolve2("docs" + dir, "index.json");
    sub_dirs[dir] = {
      link: dir,
      text: get_title(dir),
      collapsed: true,
      items: JSON.parse(readFileSync3(json, "utf8"))
    };
  }
  const items = [];
  arrange_links:
    for (const link of arr) {
      const text = get_title(link);
      if (link in sub_dirs) {
        items.push(sub_dirs[link]);
      } else {
        for (const dir of dirs)
          if (link.startsWith(dir)) {
            for (const sub_item of sub_dirs[dir].items) {
              if ((sub_item?.link ?? sub_item) === link)
                continue arrange_links;
            }
            sub_dirs[dir].items.push({ link, text: get_title(link) });
            continue arrange_links;
          }
        items.push({ link, text: get_title(link) });
      }
    }
  for (const el of items) {
    if (!el?.items?.length) {
      delete el.items;
      delete el.collapsed;
    }
  }
  return items;
}
for (const key in sidebar) {
  sidebar[key] = reform(sidebar[key], key);
}
try {
  mkdirSync2("var", { recursive: true });
  writeFileSync2(
    resolve2("var", "sidebar.json"),
    JSON.stringify(sidebar, null, 4)
  );
} catch (e) {
  console.error(e);
}
var sidebar_default = sidebar;

// config/search.js
import { Worker, isMainThread, parentPort } from "worker_threads";
async function worker() {
  const { existsSync: existsSync3, readFileSync: readFileSync5 } = await import("node:fs");
  const { JSDOM } = await import("file:///Users/Yuxuan/Lab/xorg-doc/node_modules/jsdom/lib/api.js");
  const {
    skippableTraverse: traverse2,
    ELEMENT_NODE: ELEMENT_NODE2,
    TEXT_NODE: TEXT_NODE2
  } = await Promise.resolve().then(() => (init_traverse(), traverse_exports));
  const path = await new Promise((res) => parentPort.once("message", res));
  if (!existsSync3(path))
    return;
  const html = readFileSync5(
    path.replace(/(\.md)?$/, ".src.html"),
    "utf-8"
  );
  const dom = JSDOM.fragment(html);
  const titleStack = [];
  const existingIdSet = /* @__PURE__ */ new Set();
  let section = { text: "", titles: [""] };
  function submit() {
    section.text = section.text.replace(/\W+/sg, " ").trim();
    if (section.text || section.anchor) {
      parentPort.postMessage(section);
    }
  }
  for (const [el, skipChildren] of traverse2(dom)) {
    if (el.nodeType === ELEMENT_NODE2) {
      if (!/^H\d+$/i.test(el.tagName))
        continue;
      if (!el.hasAttribute("id"))
        continue;
      const id = el.getAttribute("id");
      if (existingIdSet.has(id)) {
        const rel_path = path.slice(process.cwd().length + 1);
        console.warn(
          `\x1B[2K\r\u26A0\uFE0F  Duplicate id ${id} in ${rel_path}`
        );
        continue;
      }
      existingIdSet.add(id);
      submit();
      const level = parseInt(el.tagName.slice(1));
      while (titleStack.length > 0) {
        if (titleStack.at(-1).level >= level)
          titleStack.pop();
        else
          break;
      }
      titleStack.push({ level, text: el.textContent });
      section = {
        text: "",
        anchor: el.getAttribute("id"),
        titles: titleStack.map((_) => _.text)
      };
      skipChildren();
    } else if (el.nodeType === TEXT_NODE2) {
      section.text += el.textContent;
    }
  }
  submit();
}
if (!isMainThread)
  worker();

// config/config.mjs
var base = process.cwd();
if (existsSync2(resolve3(base, "docs", "index.md"))) {
  copyFileSync(resolve3(base, "docs", "index.md"), resolve3(base, "docs", "README.md"));
}
var config_default = VitePressConfig({
  sitemap: {
    hostname: "https://x.z-yx.cc/"
  },
  outDir: resolve3(base, "var", "dist"),
  title: "Docs",
  description: "Modern looking documentation for X. Content ported from X.org (version 11, release 7.7).",
  metaChunk: true,
  head: [
    ["link", { rel: "manifest", href: "/app.webmanifest" }],
    ["link", { rel: "icon", sizes: "512x512", href: "/icon.round.png" }],
    ["link", { rel: "icon", sizes: "256x256", href: "/icon.round.256.png" }],
    ["link", { rel: "icon", sizes: "128x128", href: "/icon.round.128.png" }],
    ["link", { rel: "icon", sizes: "64x64", href: "/icon.round.64.png" }],
    // iOS web app tweaks
    ["link", { rel: "apple-touch-icon", href: "/icon.png" }],
    ["meta", { name: "apple-mobile-web-app-capable", content: "yes" }]
  ],
  // https://vitepress.dev/reference/default-theme-config
  themeConfig: {
    nav: nav_default,
    sidebar: sidebar_default,
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/zhangyx-lab/x-doc"
      }
    ],
    logo: "/x.svg",
    logoLink: "/",
    outline: "deep"
    // search: {
    //     provider: 'local',
    //     options: {
    //         miniSearch: {
    //             splitIntoSections
    //         }
    //     }
    // }
  },
  vite: {
    build: {
      chunkSizeWarningLimit: 4096
    },
    plugins: [{
      load(id) {
        if (id === resolve3(base, "docs", "index.md")) {
          return readFileSync4(resolve3(base, "index.md"), "utf-8");
        }
      }
    }]
  }
});
export {
  config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibGliL3RyYXZlcnNlLmpzIiwgImNvbmZpZy9jb25maWcubWpzIiwgImNvbmZpZy9uYXYuanMiLCAiY29uZmlnL2dldC10aXRsZS5qcyIsICJjb25maWcvc2lkZWJhci5qcyIsICJsaWIvdXRpbGl0eS5qcyIsICJjb25maWcvc2VhcmNoLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL1l1eHVhbi9MYWIveG9yZy1kb2MvbGliXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvWXV4dWFuL0xhYi94b3JnLWRvYy9saWIvdHJhdmVyc2UuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL1l1eHVhbi9MYWIveG9yZy1kb2MvbGliL3RyYXZlcnNlLmpzXCI7LyogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKiBDb3B5cmlnaHQgKGMpIDIwMjMgWXV4dWFuIFpoYW5nLCB3ZWItZGV2QHoteXguY2NcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuICogWW91IG1heSBmaW5kIHRoZSBmdWxsIGxpY2Vuc2UgaW4gcHJvamVjdCByb290IGRpcmVjdG9yeS5cbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xuXG4vLyBOb2RlIHR5cGUgY29uc3RhbnRzXG5leHBvcnQgY29uc3RcbiAgICAvLyBBbiBFbGVtZW50IG5vZGUgbGlrZSA8cD4gb3IgPGRpdj4uXG4gICAgRUxFTUVOVF9OT0RFID0gMSxcbiAgICAvLyBBbiBBdHRyaWJ1dGUgb2YgYW4gRWxlbWVudC5cbiAgICBBVFRSSUJVVEVfTk9ERSA9IDIsXG4gICAgLy8gVGhlIGFjdHVhbCBUZXh0IGluc2lkZSBhbiBFbGVtZW50IG9yIEF0dHIuXG4gICAgVEVYVF9OT0RFID0gMyxcbiAgICAvLyBBIENEQVRBU2VjdGlvbiwgc3VjaCBhcyA8IUNEQVRBW1sgXHUyMDI2IF1dPlxuICAgIENEQVRBX1NFQ1RJT05fTk9ERSA9IDQsXG4gICAgLy8gQSBQcm9jZXNzaW5nSW5zdHJ1Y3Rpb24gb2YgYW4gWE1MIGRvY3VtZW50LCBzdWNoIGFzIDw/eG1sLXN0eWxlc2hlZXQgXHUyMDI2ID8+LlxuICAgIFBST0NFU1NJTkdfSU5TVFJVQ1RJT05fTk9ERSA9IDcsXG4gICAgLy8gQSBDb21tZW50IG5vZGUsIHN1Y2ggYXMgPCEtLSBcdTIwMjYgLS0+LlxuICAgIENPTU1FTlRfTk9ERSA9IDgsXG4gICAgLy8gQSBEb2N1bWVudCBub2RlLlxuICAgIERPQ1VNRU5UX05PREUgPSA5LFxuICAgIC8vIEEgRG9jdW1lbnRUeXBlIG5vZGUsIHN1Y2ggYXMgPCFET0NUWVBFIGh0bWw+LlxuICAgIERPQ1VNRU5UX1RZUEVfTk9ERSA9IDEwLFxuICAgIC8vIEEgRG9jdW1lbnRGcmFnbWVudCBub2RlLlxuICAgIERPQ1VNRU5UX0ZSQUdNRU5UX05PREUgPSAxMTtcblxuLyoqXG4gKiBUcmF2ZXJzZSB0aGUgRE9NIHRyZWUsIGFuZCB5aWVsZCBlYWNoIG5vZGUgaW4gdGhlIG9yZGVyIHRoZXkgYXBwZWFyLlxuICogUGFyZW50IG5vZGVzIGFyZSB5aWVsZGVkIGJlZm9yZSB0aGVpciBjaGlsZHJlbi5cbiAqIEBwYXJhbSB7RWxlbWVudFtdfSBub2RlcyBcbiAqIEByZXR1cm5zIHtHZW5lcmF0b3I8RWxlbWVudCwgdm9pZCwgdm9pZD59XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKiB0cmF2ZXJzZSguLi5ub2Rlcykge1xuICAgIGZvciAoY29uc3Qgbm9kZSBvZiBub2Rlcykge1xuICAgICAgICB5aWVsZCBub2RlO1xuICAgICAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIG5vZGU/LmNoaWxkTm9kZXMgPz8gW10pIHtcbiAgICAgICAgICAgIHlpZWxkKiB0cmF2ZXJzZShjaGlsZCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogVHJhdmVyc2UgdGhlIERPTSB0cmVlLCBhbmQgeWllbGQgZWFjaCBub2RlIGluIHRoZSBvcmRlciB0aGV5IGFwcGVhci5cbiAqIFBhcmVudCBub2RlcyBhcmUgeWllbGRlZCBiZWZvcmUgdGhlaXIgY2hpbGRyZW4uXG4gKiBAcGFyYW0ge0VsZW1lbnRbXX0gbm9kZXMgXG4gKiBAcmV0dXJucyB7R2VuZXJhdG9yPFtFbGVtZW50LCAoc2tpcD86Qm9vbGVhbikgPT4gYW55XSwgdm9pZCwgdm9pZD59XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiogc2tpcHBhYmxlVHJhdmVyc2UoLi4ubm9kZXMpIHtcbiAgICBmb3IgKGNvbnN0IG5vZGUgb2Ygbm9kZXMpIHtcbiAgICAgICAgbGV0IHNraXAgPSBmYWxzZTtcbiAgICAgICAgeWllbGQgW25vZGUsIChmID0gdHJ1ZSkgPT4gc2tpcCA9IGZdO1xuICAgICAgICBpZiAoc2tpcCkgY29udGludWU7XG4gICAgICAgIGZvciAoY29uc3QgY2hpbGQgb2Ygbm9kZT8uY2hpbGROb2RlcyA/PyBbXSkge1xuICAgICAgICAgICAgeWllbGQqIHNraXBwYWJsZVRyYXZlcnNlKGNoaWxkKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL1l1eHVhbi9MYWIveG9yZy1kb2MvY29uZmlnXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvWXV4dWFuL0xhYi94b3JnLWRvYy9jb25maWcvY29uZmlnLm1qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvWXV4dWFuL0xhYi94b3JnLWRvYy9jb25maWcvY29uZmlnLm1qc1wiOy8qIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICogQ29weXJpZ2h0IChjKSAyMDIzIFl1eHVhbiBaaGFuZywgd2ViLWRldkB6LXl4LmNjXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cbiAqIFlvdSBtYXkgZmluZCB0aGUgZnVsbCBsaWNlbnNlIGluIHByb2plY3Qgcm9vdCBkaXJlY3RvcnkuXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cblxuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgIGV4aXN0c1N5bmMgLHJlYWRGaWxlU3luYywgY29weUZpbGVTeW5jIH0gZnJvbSAnZnMnO1xuXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgYXMgVml0ZVByZXNzQ29uZmlnIH0gZnJvbSAndml0ZXByZXNzJztcblxuaW1wb3J0IG5hdiBmcm9tICcuL25hdi5qcyc7XG5pbXBvcnQgc2lkZWJhciBmcm9tICcuL3NpZGViYXIuanMnO1xuaW1wb3J0IHsgc3BsaXRJbnRvU2VjdGlvbnMgfSBmcm9tICcuL3NlYXJjaC5qcyc7XG5cbmNvbnN0IGJhc2UgPSBwcm9jZXNzLmN3ZCgpO1xuXG5pZiAoZXhpc3RzU3luYyhyZXNvbHZlKGJhc2UsICdkb2NzJywgJ2luZGV4Lm1kJykpKSB7XG4gICAgY29weUZpbGVTeW5jKHJlc29sdmUoYmFzZSwgJ2RvY3MnLCAnaW5kZXgubWQnKSwgcmVzb2x2ZShiYXNlLCAnZG9jcycsICdSRUFETUUubWQnKSk7XG59XG5cbi8vIGh0dHBzOi8vdml0ZXByZXNzLmRldi9yZWZlcmVuY2Uvc2l0ZS1jb25maWdcbmV4cG9ydCBkZWZhdWx0IFZpdGVQcmVzc0NvbmZpZyh7XG4gICAgc2l0ZW1hcDoge1xuICAgICAgICBob3N0bmFtZTogJ2h0dHBzOi8veC56LXl4LmNjLydcbiAgICB9LFxuICAgIG91dERpcjogcmVzb2x2ZShiYXNlLCAndmFyJywgJ2Rpc3QnKSxcbiAgICB0aXRsZTogXCJEb2NzXCIsXG4gICAgZGVzY3JpcHRpb246IFwiTW9kZXJuIGxvb2tpbmcgZG9jdW1lbnRhdGlvbiBmb3IgWC4gQ29udGVudCBwb3J0ZWQgZnJvbSBYLm9yZyAodmVyc2lvbiAxMSwgcmVsZWFzZSA3LjcpLlwiLFxuICAgIG1ldGFDaHVuazogdHJ1ZSxcbiAgICBoZWFkOiBbXG4gICAgICAgIFsnbGluaycsIHsgcmVsOiAnbWFuaWZlc3QnLCBocmVmOiAnL2FwcC53ZWJtYW5pZmVzdCcgfV0sXG4gICAgICAgIFsnbGluaycsIHsgcmVsOiAnaWNvbicsIHNpemVzOiAnNTEyeDUxMicsIGhyZWY6ICcvaWNvbi5yb3VuZC5wbmcnIH1dLFxuICAgICAgICBbJ2xpbmsnLCB7IHJlbDogJ2ljb24nLCBzaXplczogJzI1NngyNTYnLCBocmVmOiAnL2ljb24ucm91bmQuMjU2LnBuZycgfV0sXG4gICAgICAgIFsnbGluaycsIHsgcmVsOiAnaWNvbicsIHNpemVzOiAnMTI4eDEyOCcsIGhyZWY6ICcvaWNvbi5yb3VuZC4xMjgucG5nJyB9XSxcbiAgICAgICAgWydsaW5rJywgeyByZWw6ICdpY29uJywgc2l6ZXM6ICc2NHg2NCcsIGhyZWY6ICcvaWNvbi5yb3VuZC42NC5wbmcnIH1dLFxuICAgICAgICAvLyBpT1Mgd2ViIGFwcCB0d2Vha3NcbiAgICAgICAgWydsaW5rJywgeyByZWw6ICdhcHBsZS10b3VjaC1pY29uJywgaHJlZjogJy9pY29uLnBuZycgfV0sXG4gICAgICAgIFsnbWV0YScsIHsgbmFtZTogJ2FwcGxlLW1vYmlsZS13ZWItYXBwLWNhcGFibGUnLCBjb250ZW50OiAneWVzJyB9XSxcbiAgICBdLFxuICAgIC8vIGh0dHBzOi8vdml0ZXByZXNzLmRldi9yZWZlcmVuY2UvZGVmYXVsdC10aGVtZS1jb25maWdcbiAgICB0aGVtZUNvbmZpZzoge1xuICAgICAgICBuYXYsXG4gICAgICAgIHNpZGViYXIsXG4gICAgICAgIHNvY2lhbExpbmtzOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWNvbjogJ2dpdGh1YicsXG4gICAgICAgICAgICAgICAgbGluazogJ2h0dHBzOi8vZ2l0aHViLmNvbS96aGFuZ3l4LWxhYi94LWRvYydcbiAgICAgICAgICAgIH1cbiAgICAgICAgXSxcbiAgICAgICAgbG9nbzogJy94LnN2ZycsXG4gICAgICAgIGxvZ29MaW5rOiAnLycsXG4gICAgICAgIG91dGxpbmU6ICdkZWVwJyxcbiAgICAgICAgLy8gc2VhcmNoOiB7XG4gICAgICAgIC8vICAgICBwcm92aWRlcjogJ2xvY2FsJyxcbiAgICAgICAgLy8gICAgIG9wdGlvbnM6IHtcbiAgICAgICAgLy8gICAgICAgICBtaW5pU2VhcmNoOiB7XG4gICAgICAgIC8vICAgICAgICAgICAgIHNwbGl0SW50b1NlY3Rpb25zXG4gICAgICAgIC8vICAgICAgICAgfVxuICAgICAgICAvLyAgICAgfVxuICAgICAgICAvLyB9XG4gICAgfSxcbiAgICB2aXRlOiB7XG4gICAgICAgIGJ1aWxkOiB7XG4gICAgICAgICAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDQwOTYsXG4gICAgICAgIH0sXG4gICAgICAgIHBsdWdpbnM6IFt7XG4gICAgICAgICAgICBsb2FkKGlkKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlkID09PSByZXNvbHZlKGJhc2UsICdkb2NzJywgJ2luZGV4Lm1kJykpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlYWRGaWxlU3luYyhyZXNvbHZlKGJhc2UsICdpbmRleC5tZCcpLCAndXRmLTgnKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfV1cbiAgICB9XG59KVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvWXV4dWFuL0xhYi94b3JnLWRvYy9jb25maWdcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9ZdXh1YW4vTGFiL3hvcmctZG9jL2NvbmZpZy9uYXYuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL1l1eHVhbi9MYWIveG9yZy1kb2MvY29uZmlnL25hdi5qc1wiOy8qIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICogQ29weXJpZ2h0IChjKSAyMDIzIFl1eHVhbiBaaGFuZywgd2ViLWRldkB6LXl4LmNjXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cbiAqIFlvdSBtYXkgZmluZCB0aGUgZnVsbCBsaWNlbnNlIGluIHByb2plY3Qgcm9vdCBkaXJlY3RvcnkuXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cblxuaW1wb3J0IHsgcmVhZEZpbGVTeW5jLCB3cml0ZUZpbGVTeW5jLCBta2RpclN5bmMgfSBmcm9tICdmcyc7XG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCc7XG5cbmltcG9ydCBnZXRfdGl0bGUgZnJvbSAnLi9nZXQtdGl0bGUuanMnO1xuXG5jb25zdCBkb2Nfcm9vdCA9IHJlc29sdmUocHJvY2Vzcy5lbnYuUFdELCAnZG9jcycpO1xuY29uc3QgaW5kZXggPSByZWFkRmlsZVN5bmMocmVzb2x2ZShkb2Nfcm9vdCwgJ2luZGV4Lmpzb24nKSwgJ3V0ZjgnKTtcblxuY29uc3QgbmF2ID0gW107XG5cbmxldCBjdHg7XG5mb3IgKGNvbnN0IHsgY29udGV4dCA9IHt9LCBsaW5rID0gJycgfSBvZiBKU09OLnBhcnNlKGluZGV4KSkge1xuICAgIGxldCB7IEgyID0gXCJBYm91dFwiLCBIMyB9ID0gY29udGV4dDtcbiAgICBIMiA9IEgyLnJlcGxhY2UoL1xcOiQvLCAnJyk7XG4gICAgaWYgKEgyICE9PSBjdHg/LnRleHQpIHtcbiAgICAgICAgY3R4ID0geyB0ZXh0OiBIMiwgaXRlbXM6IFtdLCBzdWJfZGlyczoge30gfTtcbiAgICAgICAgbmF2LnB1c2goY3R4KTtcbiAgICB9XG4gICAgbGV0IHsgaXRlbXMgfSA9IGN0eDtcbiAgICBpZiAoSDMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBIMyA9IEgzLnJlcGxhY2UoL1xcOiQvLCAnJyk7XG4gICAgICAgIGlmICghY3R4LnN1Yl9kaXJzW0gzXSkge1xuICAgICAgICAgICAgY3R4LnN1Yl9kaXJzW0gzXSA9IHsgdGV4dDogSDMsIGl0ZW1zOiBbXSB9O1xuICAgICAgICAgICAgY3R4Lml0ZW1zLnB1c2goY3R4LnN1Yl9kaXJzW0gzXSk7XG4gICAgICAgIH1cbiAgICAgICAgaXRlbXMgPSBjdHguc3ViX2RpcnNbSDNdLml0ZW1zO1xuICAgIH1cbiAgICBpdGVtcy5wdXNoKHsgdGV4dDogZ2V0X3RpdGxlKGxpbmspLCBsaW5rIH0pO1xufVxuXG5mb3IgKGNvbnN0IGVsIG9mIG5hdikge1xuICAgIGRlbGV0ZSBlbC5zdWJfZGlycztcbn1cblxudHJ5IHtcbiAgICBta2RpclN5bmMoJ3ZhcicsIHsgcmVjdXJzaXZlOiB0cnVlIH0pXG4gICAgd3JpdGVGaWxlU3luYyhcbiAgICAgICAgcmVzb2x2ZSgndmFyJywgJ25hdi5qc29uJyksXG4gICAgICAgIEpTT04uc3RyaW5naWZ5KG5hdiwgbnVsbCwgNClcbiAgICApO1xufSBjYXRjaCAoZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoZSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IG5hdjsiLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9ZdXh1YW4vTGFiL3hvcmctZG9jL2NvbmZpZ1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL1l1eHVhbi9MYWIveG9yZy1kb2MvY29uZmlnL2dldC10aXRsZS5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvWXV4dWFuL0xhYi94b3JnLWRvYy9jb25maWcvZ2V0LXRpdGxlLmpzXCI7LyogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKiBDb3B5cmlnaHQgKGMpIDIwMjMgWXV4dWFuIFpoYW5nLCB3ZWItZGV2QHoteXguY2NcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuICogWW91IG1heSBmaW5kIHRoZSBmdWxsIGxpY2Vuc2UgaW4gcHJvamVjdCByb290IGRpcmVjdG9yeS5cbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xuXG5pbXBvcnQgeyByZWFkRmlsZVN5bmMgfSBmcm9tICdmcyc7XG5cbmltcG9ydCBmbSBmcm9tICdmcm9udC1tYXR0ZXInO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBnZXRfdGl0bGUoaWQpIHtcbiAgICBjb25zdCBtZF9zcmMgPSBcImRvY3MvXCIgKyBpZFxuICAgICAgICAucmVwbGFjZSgvXlxcLysvZ2ksICcnKVxuICAgICAgICAucmVwbGFjZSgvXFwvJC8sICcvaW5kZXgnKSArIFwiLm1kXCI7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZmlsZSA9IGZtKHJlYWRGaWxlU3luYyhtZF9zcmMsICd1dGY4JykpO1xuICAgICAgICBpZiAoZmlsZT8uYXR0cmlidXRlcz8udGl0bGUpXG4gICAgICAgICAgICByZXR1cm4gZmlsZT8uYXR0cmlidXRlcz8udGl0bGVcbiAgICB9IGNhdGNoIChfKSB7IH1cbiAgICByZXR1cm4gaWQucmVwbGFjZSgnLycsICctJyk7XG59XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9ZdXh1YW4vTGFiL3hvcmctZG9jL2NvbmZpZ1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL1l1eHVhbi9MYWIveG9yZy1kb2MvY29uZmlnL3NpZGViYXIuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL1l1eHVhbi9MYWIveG9yZy1kb2MvY29uZmlnL3NpZGViYXIuanNcIjsvKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAqIENvcHlyaWdodCAoYykgMjAyMyBZdXh1YW4gWmhhbmcsIHdlYi1kZXZAei15eC5jY1xuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG4gKiBZb3UgbWF5IGZpbmQgdGhlIGZ1bGwgbGljZW5zZSBpbiBwcm9qZWN0IHJvb3QgZGlyZWN0b3J5LlxuICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXG5cbmltcG9ydCB7IHJlYWRGaWxlU3luYywgd3JpdGVGaWxlU3luYywgbWtkaXJTeW5jLCBleGlzdHNTeW5jIH0gZnJvbSAnZnMnO1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnO1xuXG5pbXBvcnQgeyBjb21wYXJlX3BhdGggfSBmcm9tICcuLi9saWIvdXRpbGl0eS5qcyc7XG5pbXBvcnQgZ2V0X3RpdGxlIGZyb20gJy4vZ2V0LXRpdGxlLmpzJztcbmltcG9ydCB7IGdldCB9IGZyb20gJ2h0dHAnO1xuXG5jb25zdCBkb2Nfcm9vdCA9IHJlc29sdmUocHJvY2Vzcy5lbnYuUFdELCAnZG9jcycpO1xuY29uc3QgbGlzdCA9IHJlYWRGaWxlU3luYyhyZXNvbHZlKGRvY19yb290LCAncmVtYXAubGlzdCcpLCAndXRmOCcpXG4gICAgLnNwbGl0KCdcXG4nKVxuICAgIC5maWx0ZXIoQm9vbGVhbilcbiAgICAubWFwKGwgPT4gbC50cmltKCkpO1xuXG5jb25zdCBzaWRlYmFyID0gbGlzdC5yZWR1Y2UoKGRpY3QsIHNyY19pZCkgPT4ge1xuICAgIGNvbnN0IFtkaXIsIC4uLnBhdGhzXSA9IHNyY19pZC5zcGxpdCgnLycpO1xuICAgIGlmIChwYXRocy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgLy8gUm9vdCBsZXZlbCBlbnRyeVxuICAgICAgICBkaWN0WycvJ10ucHVzaCgnLycgKyBzcmNfaWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGtleSA9ICcvJyArICgoKSA9PiB7XG4gICAgICAgICAgICBpZiAoZGlyID09PSAnbWFuJyAmJiBwYXRocy5sZW5ndGggPiAxKVxuICAgICAgICAgICAgICAgIHJldHVybiBbZGlyLCBwYXRocy5zaGlmdCgpXS5qb2luKCcvJyk7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRpcjtcbiAgICAgICAgfSkoKSArICcvJztcbiAgICAgICAgaWYgKCEoa2V5IGluIGRpY3QpKSBkaWN0W2tleV0gPSBbXTtcbiAgICAgICAgZGljdFtrZXldLnB1c2goJy8nICsgc3JjX2lkKTtcbiAgICB9XG4gICAgcmV0dXJuIGRpY3Q7XG59LCB7ICcvJzogW10gfSk7XG5cbi8qKlxuICogQHBhcmFtIHtBcnJheVtzdHJpbmddfSBhcnIgQXJyYXkgb2YgYWxsIGxpbmtzIHVuZGVyIGtleVxuICogQHBhcmFtIHsqfSBrZXkgS2V5IG9mIHRoZSBzaWRlYmFyXG4gKi9cbmZ1bmN0aW9uIHJlZm9ybShhcnIsIGtleSkge1xuICAgIC8vIFsxc3Qgc2Nhbl0gYWxsIGxpbmtzIGVuZGluZyB3aXRoICcvJ1xuICAgIGNvbnN0IGRpcnMgPSBhcnJcbiAgICAgICAgLmZpbHRlcihsaW5rID0+IGxpbmsuZW5kc1dpdGgoJy8nKSlcbiAgICAgICAgLy8gRGVlcGVyIHBhdGggY29tZXMgZmlyc3RcbiAgICAgICAgLnNvcnQoY29tcGFyZV9wYXRoKVxuICAgICAgICAucmV2ZXJzZSgpO1xuICAgIC8vIFBvaW50ZXJzIHRvIHNpYi1kaXJlY3Rvcmllc1xuICAgIGNvbnN0IHN1Yl9kaXJzID0ge307XG4gICAgLy8gWzJuZCBzY2FuXSBSZXRyaWV2ZSBzdWItaW5kZXhlcyBmcm9tIHN1Yi1kaXJlY3Rvcmllc1xuICAgIGZvciAoY29uc3QgZGlyIG9mIGRpcnMpIHtcbiAgICAgICAgLy8gVHJ5IHRvIGZpbmQgaW5kZXguanNvbiB1bmRlciB0aGlzIGRpclxuICAgICAgICBjb25zdCBqc29uID0gcmVzb2x2ZSgnZG9jcycgKyBkaXIsICdpbmRleC5qc29uJyk7XG4gICAgICAgIHN1Yl9kaXJzW2Rpcl0gPSB7XG4gICAgICAgICAgICBsaW5rOiBkaXIsXG4gICAgICAgICAgICB0ZXh0OiBnZXRfdGl0bGUoZGlyKSxcbiAgICAgICAgICAgIGNvbGxhcHNlZDogdHJ1ZSxcbiAgICAgICAgICAgIGl0ZW1zOiBKU09OLnBhcnNlKHJlYWRGaWxlU3luYyhqc29uLCAndXRmOCcpKVxuICAgICAgICB9XG4gICAgfVxuICAgIC8vIExpc3Qgb2YgaXRlbXMgYXMgZmluYWwgcmVzdWx0XG4gICAgY29uc3QgaXRlbXMgPSBbXTtcbiAgICAvLyBbM3JkIHNjYW5dIEFycmFuZ2UgbGlua3NcbiAgICBhcnJhbmdlX2xpbmtzOiBmb3IgKGNvbnN0IGxpbmsgb2YgYXJyKSB7XG4gICAgICAgIGNvbnN0IHRleHQgPSBnZXRfdGl0bGUobGluayk7XG4gICAgICAgIGlmIChsaW5rIGluIHN1Yl9kaXJzKSB7XG4gICAgICAgICAgICBpdGVtcy5wdXNoKHN1Yl9kaXJzW2xpbmtdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIENoZWNrIGlmIGxpbmsgYmVsb25ncyB0byBhIHN1Yi1kaXJlY3RvcnlcbiAgICAgICAgICAgIGZvciAoY29uc3QgZGlyIG9mIGRpcnMpIGlmIChsaW5rLnN0YXJ0c1dpdGgoZGlyKSkge1xuICAgICAgICAgICAgICAgIC8vIENoZWNrIGlmIGxpbmsgaXMgYWxyZWFkeSBpbmNsdWRlZCBmcm9tIGluZGV4Lmpzb25cbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHN1Yl9pdGVtIG9mIHN1Yl9kaXJzW2Rpcl0uaXRlbXMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKChzdWJfaXRlbT8ubGluayA/PyBzdWJfaXRlbSkgPT09IGxpbmspXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBMaW5rIGlzIGFscmVhZHkgaW5jbHVkZWQsIHNraXBcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlIGFycmFuZ2VfbGlua3M7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIExpbmsgaXMgbm90IGluY2x1ZGVkLCBhZGQgaXQgdG8gc3ViLWRpcmVjdG9yeVxuICAgICAgICAgICAgICAgIHN1Yl9kaXJzW2Rpcl0uaXRlbXMucHVzaCh7IGxpbmssIHRleHQ6IGdldF90aXRsZShsaW5rKSB9KTtcbiAgICAgICAgICAgICAgICBjb250aW51ZSBhcnJhbmdlX2xpbmtzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gTGluayBkb2VzIG5vdCBiZWxvbmcgdG8gYW55IHN1Yi1kaXJlY3RvcnlcbiAgICAgICAgICAgIGl0ZW1zLnB1c2goeyBsaW5rLCB0ZXh0OiBnZXRfdGl0bGUobGluaykgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gWzR0aCBzY2FuXSBSZW1vdmUgZW1wdHkgc3ViLWRpcmVjdG9yaWVzXG4gICAgZm9yIChjb25zdCBlbCBvZiBpdGVtcykge1xuICAgICAgICBpZiAoIWVsPy5pdGVtcz8ubGVuZ3RoKSB7XG4gICAgICAgICAgICBkZWxldGUgZWwuaXRlbXM7XG4gICAgICAgICAgICBkZWxldGUgZWwuY29sbGFwc2VkO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIFJldHVybiBmaW5hbCByZXN1bHRcbiAgICByZXR1cm4gaXRlbXNcbn1cblxuZm9yIChjb25zdCBrZXkgaW4gc2lkZWJhcikge1xuICAgIHNpZGViYXJba2V5XSA9IHJlZm9ybShzaWRlYmFyW2tleV0sIGtleSk7XG59XG5cbnRyeSB7XG4gICAgbWtkaXJTeW5jKCd2YXInLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KVxuICAgIHdyaXRlRmlsZVN5bmMoXG4gICAgICAgIHJlc29sdmUoJ3ZhcicsICdzaWRlYmFyLmpzb24nKSxcbiAgICAgICAgSlNPTi5zdHJpbmdpZnkoc2lkZWJhciwgbnVsbCwgNClcbiAgICApO1xufSBjYXRjaCAoZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoZSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHNpZGViYXI7XG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy9ZdXh1YW4vTGFiL3hvcmctZG9jL2xpYlwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL1l1eHVhbi9MYWIveG9yZy1kb2MvbGliL3V0aWxpdHkuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL1l1eHVhbi9MYWIveG9yZy1kb2MvbGliL3V0aWxpdHkuanNcIjsvKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAqIENvcHlyaWdodCAoYykgMjAyMyBZdXh1YW4gWmhhbmcsIHdlYi1kZXZAei15eC5jY1xuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG4gKiBZb3UgbWF5IGZpbmQgdGhlIGZ1bGwgbGljZW5zZSBpbiBwcm9qZWN0IHJvb3QgZGlyZWN0b3J5LlxuICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXG5cbi8vIFNvcnQgc291cmNlIGZpbGVzIFxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBhcmVfcGF0aChfYSwgX2IpIHtcbiAgICBjb25zdCBhID0gX2Euc3BsaXQoJy8nKSwgYiA9IF9iLnNwbGl0KCcvJyk7XG4gICAgd2hpbGUgKGEubGVuZ3RoICYmIGIubGVuZ3RoKSB7XG4gICAgICAgIGNvbnN0IFt4LCB5XSA9IFthLnNoaWZ0KCksIGIuc2hpZnQoKV1cbiAgICAgICAgaWYgKHggPT09IHkpIGNvbnRpbnVlO1xuICAgICAgICAvLyBJbmRleCBmaWxlIGZpcnN0XG4gICAgICAgIGlmICh4ID09PSAnaW5kZXgnKSByZXR1cm4gLTE7XG4gICAgICAgIGlmICh5ID09PSAnaW5kZXgnKSByZXR1cm4gMTtcbiAgICAgICAgLy8gU2hvcnRlciBwYXRoIGZpcnN0XG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cbn07XG5cbi8qKlxuICogQHRlbXBsYXRlIFRcbiAqIEByZXR1cm5zIHt7XG4gKiBwcm9taXNlOiBQcm9taXNlPFQ+LFxuICogcmVzb2x2ZTogKHZhbHVlOiBUKSA9PiB2b2lkLFxuICogcmVqZWN0OiAoZXJyb3I6IGFueSkgPT4gdm9pZCxcbiAqIH19IGEgZGVmZXJyZWQgcHJvbWlzZSB3aXRoIGl0cyByZXNvbHZlL3JlamVjdCBoYW5kbGVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWZlclByb21pc2UoKSB7XG4gICAgbGV0IHJlc29sdmUsIHJlamVjdDtcbiAgICBjb25zdCBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlcywgcmVqKSA9PiB7XG4gICAgICAgIHJlc29sdmUgPSByZXM7XG4gICAgICAgIHJlamVjdCA9IHJlajtcbiAgICB9KTtcbiAgICByZXR1cm4geyBwcm9taXNlLCByZXNvbHZlLCByZWplY3QgfTtcbn1cblxuLyoqIEB0ZW1wbGF0ZSBULCBSICovXG5jbGFzcyBBc3luY0dlbmVyYXRvciB7XG5cbiAgICBbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09IFJlY2VpdmVyID09PT09PT09PT09PT09PT09PT1cbiAgICAjZGF0YV9zdWJzY3JpYmVycyA9IFtdO1xuICAgIG5leHQoKSB7XG4gICAgICAgIGNvbnN0IHsgcHJvbWlzZSwgcmVzb2x2ZSwgcmVqZWN0IH0gPSBkZWZlclByb21pc2UoKTtcbiAgICAgICAgdGhpcy4jZGF0YV9zdWJzY3JpYmVycy5wdXNoKHsgcmVzb2x2ZSwgcmVqZWN0IH0pO1xuICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9XG5cbiAgICAjcmV0dXJuX3N1YnNjcmliZXJzID0gW107XG4gICAgYXN5bmMgcmV0dXJuKHZhbHVlKSB7XG4gICAgfVxuICAgIC8vID09PT09PT09PT09PT09PT09PT0gR2VuZXJhdG9yID09PT09PT09PT09PT09PT09PT1cbn1cblxuLyoqXG4gKiBDcmVhdGUgYXN5bmMgZ2VuZXJhdG9yIHdpdGggY2FsbGJhY2sgaGFuZGxlcnNcbiAqIEB0ZW1wbGF0ZSBULCBSXG4gKiBAcmV0dXJucyB7W0FzeW5jR2VuZXJhdG9yPFQsIFI+LCB7XG4gKiB5aWVsZDogKHZhbHVlOiBUKSA9PiB2b2lkLFxuICogcmV0dXJuOiAodmFsdWU6IFIpID0+IHZvaWQsXG4gKiB0aHJvdzogKGVycm9yOiBhbnkpID0+IHZvaWQsXG4gKiB9XX1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUFzeW5jR2VuZXJhdG9yKCkge1xuICAgIGxldCBuZXh0RXZlbnQgPSBkZWZlclByb21pc2UoKTtcbiAgICBsZXQgbmV4dFZhbHVlO1xuICAgIGFzeW5jIGZ1bmN0aW9uKiBnZW5lcmF0b3IoKSB7XG4gICAgICAgIHdoaWxlIChhd2FpdCBuZXh0RXZlbnQucHJvbWlzZSkge1xuICAgICAgICAgICAgeWllbGQgbmV4dFZhbHVlO1xuICAgICAgICAgICAgbmV4dEV2ZW50ID0gZGVmZXJQcm9taXNlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5leHRWYWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIFtcbiAgICAgICAgZ2VuZXJhdG9yKCksXG4gICAgICAgIHtcbiAgICAgICAgICAgIHlpZWxkKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgbmV4dFZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgbmV4dEV2ZW50LnJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmV0dXJuKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgbmV4dFZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgbmV4dEV2ZW50LnJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRocm93KGVycm9yKSB7XG4gICAgICAgICAgICAgICAgbmV4dEV2ZW50LnJlamVjdChlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICBdO1xufVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvWXV4dWFuL0xhYi94b3JnLWRvYy9jb25maWdcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9ZdXh1YW4vTGFiL3hvcmctZG9jL2NvbmZpZy9zZWFyY2guanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL1l1eHVhbi9MYWIveG9yZy1kb2MvY29uZmlnL3NlYXJjaC5qc1wiOy8qIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICogQ29weXJpZ2h0IChjKSAyMDIzIFl1eHVhbiBaaGFuZywgd2ViLWRldkB6LXl4LmNjXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cbiAqIFlvdSBtYXkgZmluZCB0aGUgZnVsbCBsaWNlbnNlIGluIHByb2plY3Qgcm9vdCBkaXJlY3RvcnkuXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cblxuaW1wb3J0IHsgV29ya2VyLCBpc01haW5UaHJlYWQsIHBhcmVudFBvcnQgfSBmcm9tICd3b3JrZXJfdGhyZWFkcyc7XG5cbmFzeW5jIGZ1bmN0aW9uIHdvcmtlcigpIHtcbiAgICBjb25zdCB7IGV4aXN0c1N5bmMsIHJlYWRGaWxlU3luYyB9ID0gYXdhaXQgaW1wb3J0KCdub2RlOmZzJyk7XG4gICAgY29uc3QgeyBKU0RPTSB9ID0gYXdhaXQgaW1wb3J0KCdqc2RvbScpO1xuICAgIGNvbnN0IHtcbiAgICAgICAgc2tpcHBhYmxlVHJhdmVyc2U6IHRyYXZlcnNlLFxuICAgICAgICBFTEVNRU5UX05PREUsXG4gICAgICAgIFRFWFRfTk9ERVxuICAgIH0gPSBhd2FpdCBpbXBvcnQoJy4uL2xpYi90cmF2ZXJzZS5qcycpO1xuICAgIC8vIFdhaXQgZm9yIG1lc3NhZ2VcbiAgICBjb25zdCBwYXRoID0gYXdhaXQgbmV3IFByb21pc2UocmVzID0+IHBhcmVudFBvcnQub25jZSgnbWVzc2FnZScsIHJlcykpO1xuICAgIC8vIFJlYWQgZmlsZVxuICAgIGlmICghZXhpc3RzU3luYyhwYXRoKSkgcmV0dXJuO1xuICAgIGNvbnN0IGh0bWwgPSByZWFkRmlsZVN5bmMoXG4gICAgICAgIHBhdGgucmVwbGFjZSgvKFxcLm1kKT8kLywgJy5zcmMuaHRtbCcpLCAndXRmLTgnXG4gICAgKTtcbiAgICBjb25zdCBkb20gPSBKU0RPTS5mcmFnbWVudChodG1sKTtcbiAgICAvKipcbiAgICAgKiBTdGFjayBvZiB0aXRsZSBoaWVyYXJjaHkgZm9yIGN1cnJlbnQgd29ya2luZyBzZWN0aW9uXG4gICAgICogQHR5cGUge0FycmF5PHtsZXZlbDogbnVtYmVyLCB0ZXh0OiBzdHJpbmd9Pn1cbiAgICAgKi9cbiAgICBjb25zdCB0aXRsZVN0YWNrID0gW107XG4gICAgLy8gU2V0IG9mIGFsbCB1c2VkIGlkc1xuICAgIGNvbnN0IGV4aXN0aW5nSWRTZXQgPSBuZXcgU2V0KCk7XG4gICAgLy8gQ3VycmVudCB3b3JraW5nIHNlY3Rpb25cbiAgICBsZXQgc2VjdGlvbiA9IHsgdGV4dDogJycsIHRpdGxlczogWycnXSB9O1xuICAgIGZ1bmN0aW9uIHN1Ym1pdCgpIHtcbiAgICAgICAgc2VjdGlvbi50ZXh0ID0gc2VjdGlvbi50ZXh0XG4gICAgICAgICAgICAucmVwbGFjZSgvXFxXKy9zZywgJyAnKVxuICAgICAgICAgICAgLnRyaW0oKTtcbiAgICAgICAgaWYgKHNlY3Rpb24udGV4dCB8fCBzZWN0aW9uLmFuY2hvcikge1xuICAgICAgICAgICAgcGFyZW50UG9ydC5wb3N0TWVzc2FnZShzZWN0aW9uKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBUcmF2ZXJzZSB0aGUgRE9NXG4gICAgZm9yIChjb25zdCBbZWwsIHNraXBDaGlsZHJlbl0gb2YgdHJhdmVyc2UoZG9tKSkge1xuICAgICAgICBpZiAoZWwubm9kZVR5cGUgPT09IEVMRU1FTlRfTk9ERSkge1xuICAgICAgICAgICAgaWYgKCEvXkhcXGQrJC9pLnRlc3QoZWwudGFnTmFtZSkpIGNvbnRpbnVlO1xuICAgICAgICAgICAgaWYgKCFlbC5oYXNBdHRyaWJ1dGUoJ2lkJykpIGNvbnRpbnVlO1xuICAgICAgICAgICAgY29uc3QgaWQgPSBlbC5nZXRBdHRyaWJ1dGUoJ2lkJyk7XG4gICAgICAgICAgICBpZiAoZXhpc3RpbmdJZFNldC5oYXMoaWQpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVsX3BhdGggPSBwYXRoLnNsaWNlKHByb2Nlc3MuY3dkKCkubGVuZ3RoICsgMSk7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAgICAgICAgICAgICBgXFx4MWJbMktcXHJcdTI2QTBcdUZFMEYgIER1cGxpY2F0ZSBpZCAke2lkfSBpbiAke3JlbF9wYXRofWBcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZXhpc3RpbmdJZFNldC5hZGQoaWQpO1xuICAgICAgICAgICAgLy8gU3VibWl0IHByZXZpb3VzIHNlY3Rpb25cbiAgICAgICAgICAgIHN1Ym1pdCgpO1xuICAgICAgICAgICAgLy8gUG9wIGFkamFjZW50IHRpdGxlcyBkZXBlbmRpbmcgb24gbGV2ZWxcbiAgICAgICAgICAgIGNvbnN0IGxldmVsID0gcGFyc2VJbnQoZWwudGFnTmFtZS5zbGljZSgxKSk7XG4gICAgICAgICAgICB3aGlsZSAodGl0bGVTdGFjay5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRpdGxlU3RhY2suYXQoLTEpLmxldmVsID49IGxldmVsKVxuICAgICAgICAgICAgICAgICAgICB0aXRsZVN0YWNrLnBvcCgpO1xuICAgICAgICAgICAgICAgIGVsc2UgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aXRsZVN0YWNrLnB1c2goeyBsZXZlbCwgdGV4dDogZWwudGV4dENvbnRlbnQgfSk7XG4gICAgICAgICAgICAvLyBDcmVhdGUgbmV3IHNlY3Rpb25cbiAgICAgICAgICAgIHNlY3Rpb24gPSB7XG4gICAgICAgICAgICAgICAgdGV4dDogJycsXG4gICAgICAgICAgICAgICAgYW5jaG9yOiBlbC5nZXRBdHRyaWJ1dGUoJ2lkJyksXG4gICAgICAgICAgICAgICAgdGl0bGVzOiB0aXRsZVN0YWNrLm1hcChfID0+IF8udGV4dClcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBza2lwQ2hpbGRyZW4oKTtcbiAgICAgICAgfSBlbHNlIGlmIChlbC5ub2RlVHlwZSA9PT0gVEVYVF9OT0RFKSB7XG4gICAgICAgICAgICAvLyBDb2xsZWN0IHRleHQgY29udGVudFxuICAgICAgICAgICAgc2VjdGlvbi50ZXh0ICs9IGVsLnRleHRDb250ZW50XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gU3VibWl0IGxhc3Qgc2VjdGlvblxuICAgIHN1Ym1pdCgpO1xufVxuXG5pZiAoIWlzTWFpblRocmVhZCkgd29ya2VyKCk7XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT0gTUFJTiBUSFJFQUQgPT09PT09PT09PT09PT09PT09PT09PVxuXG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSAnbm9kZTp1cmwnO1xuaW1wb3J0IHsgY3JlYXRlQXN5bmNHZW5lcmF0b3IgfSBmcm9tICcuLi9saWIvdXRpbGl0eS5qcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBzcGxpdEludG9TZWN0aW9ucyhwYXRoKSB7XG4gICAgY29uc3Qgd29ya2VyID0gbmV3IFdvcmtlcihmaWxlVVJMVG9QYXRoKGltcG9ydC5tZXRhLnVybCkpO1xuXG4gICAgY29uc3QgW2dlbmVyYXRvciwgaGFuZGxlXSA9IGNyZWF0ZUFzeW5jR2VuZXJhdG9yKCk7XG4gICAgd29ya2VyLmFkZExpc3RlbmVyKCdtZXNzYWdlJywgaGFuZGxlLnlpZWxkKTtcbiAgICB3b3JrZXIuYWRkTGlzdGVuZXIoJ2Vycm9yJywgaGFuZGxlLnRocm93KTtcbiAgICB3b3JrZXIuYWRkTGlzdGVuZXIoJ2V4aXQnLCAoY29kZSkgPT4ge1xuICAgICAgICB3b3JrZXIucmVtb3ZlQWxsTGlzdGVuZXJzKClcbiAgICAgICAgaWYgKGNvZGUgIT09IDApXG4gICAgICAgICAgICBoYW5kbGUudGhyb3cobmV3IEVycm9yKGBXb3JrZXIgZXhpdCBjb2RlICR7Y29kZX1gKSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGhhbmRsZS5yZXR1cm4oKTtcbiAgICB9KTtcbiAgICAvLyBTZW5kIHBhdGggdG8gd29ya2VyIHRocmVhZFxuICAgIHdvcmtlci5wb3N0TWVzc2FnZShwYXRoKTtcbiAgICAvLyBSZXR1cm4gdGhlIGdlbmVyYXRvclxuICAgIHJldHVybiBnZW5lcmF0b3I7XG59XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFpQ2Us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T0FBTyxXQUFXLE1BQU0sa0JBQWtCLENBQUM7QUFBQSxJQUNuRSxDQUFDLFFBQVEsRUFBRSxLQUFLLFFBQVEsT0FBTyxXQUFXLE1BQU0sc0JBQXNCLENBQUM7QUFBQSxJQUN2RSxDQUFDLFFBQVEsRUFBRSxLQUFLLFFBQVEsT0FBTyxXQUFXLE1BQU0sc0JBQXNCLENBQUM7QUFBQSxJQUN2RSxDQUFDLFFBQVEsRUFBRSxLQUFLLFFBQVEsT0FBTyxTQUFTLE1BQU0scUJBQXFCLENBQUM7QUFBQTtBQUFBLElBRXBFLENBQUMsUUFBUSxFQUFFLEtBQUssb0JBQW9CLE1BQU0sWUFBWSxDQUFDO0FBQUEsSUFDdkQsQ0FBQyxRQUFRLEVBQUUsTUFBTSxnQ0FBZ0MsU0FBUyxNQUFNLENBQUM7QUFBQSxFQUNyRTtBQUFBO0FBQUEsRUFFQSxhQUFhO0FBQUEsSUFDVDtBQUFBLElBQ0E7QUFBQSxJQUNBLGFBQWE7QUFBQSxNQUNUO0FBQUEsUUFDSSxNQUFNO0FBQUEsUUFDTixNQUFNO0FBQUEsTUFDVjtBQUFBLElBQ0o7QUFBQSxJQUNBLE1BQU07QUFBQSxJQUNOLFVBQVU7QUFBQSxJQUNWLFNBQVM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFTYjtBQUFBLEVBQ0EsTUFBTTtBQUFBLElBQ0YsT0FBTztBQUFBLE1BQ0gsdUJBQXVCO0FBQUEsSUFDM0I7QUFBQSxJQUNBLFNBQVMsQ0FBQztBQUFBLE1BQ04sS0FBSyxJQUFJO0FBQ0wsWUFBSSxPQUFPQSxTQUFRLE1BQU0sUUFBUSxVQUFVLEdBQUc7QUFDMUMsaUJBQU9DLGNBQWFELFNBQVEsTUFBTSxVQUFVLEdBQUcsT0FBTztBQUFBLFFBQzFEO0FBQUEsTUFDSjtBQUFBLElBQ0osQ0FBQztBQUFBLEVBQ0w7QUFDSixDQUFDOyIsCiAgIm5hbWVzIjogWyJyZXNvbHZlIiwgImV4aXN0c1N5bmMiLCAicmVhZEZpbGVTeW5jIiwgInJlYWRGaWxlU3luYyIsICJyZWFkRmlsZVN5bmMiLCAicmVhZEZpbGVTeW5jIiwgIndyaXRlRmlsZVN5bmMiLCAibWtkaXJTeW5jIiwgInJlc29sdmUiLCAicmVzb2x2ZSIsICJkb2Nfcm9vdCIsICJyZXNvbHZlIiwgInJlYWRGaWxlU3luYyIsICJta2RpclN5bmMiLCAid3JpdGVGaWxlU3luYyIsICJleGlzdHNTeW5jIiwgInJlYWRGaWxlU3luYyIsICJ0cmF2ZXJzZSIsICJFTEVNRU5UX05PREUiLCAiVEVYVF9OT0RFIiwgImV4aXN0c1N5bmMiLCAicmVzb2x2ZSIsICJyZWFkRmlsZVN5bmMiXQp9Cg==
