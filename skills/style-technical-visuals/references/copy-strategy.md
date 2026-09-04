# Vendoring a PlanetScale Blog Post's Animations

Working procedure, distilled from the successful caching run. It produces one
self-contained HTML file that replicates every animation in a blog post,
byte-for-byte from the bundle the site serves.

Follow the steps in order. Do not skip the verification step.

## 1. Find the embed surface

The blog post embeds animations as iframes. Fetch the post HTML and list them:

```bash
curl -sL https://planetscale.com/blog/<slug> -o /tmp/post.html
grep -oE 'src="[^"]*"' /tmp/post.html | sort -u
```

Every iframe points at one bundle with a hash fragment, for example
`/blog/caching/iframe#cache-hit`. One hash equals one animation. Collect the
hash list in blog order; it becomes the shell markup in step 5.

## 2. Get the bundle files

Two options, in order of preference:

1. A vendored copy already exists. The wcygan.net repo keeps one under
   `.agents/skills/planet-scale-animation-design-system/assets/<slug>/`.
   Confirm it matches the live site before trusting it.
2. Download from the live site. Read the bundle `index.html`, then fetch each
   file it references: the entry JS module, preloaded module chunks, and the
   stylesheet. Keep the original hashed file names.

Map the chunk graph before editing. Grep each JS file for static imports:

```bash
grep -oE 'import[^;]{0,80};' *.js
grep -oE 'export ?\{[^}]*\}' *.js
```

The caching bundle had exactly two modules: a shared core that ended with
`export { $n as g };` and an entry module that imported it as
`import { g as X } from "./index-Brfk6Bdo.js";`.

## 3. Inline the chunks into one module script

Concatenate the chunks into a single `<script type="module">` inside a copy of
the bundle `index.html`. Three edits, in this order:

1. Delete import statements that name local files.
2. Replace the core's export statement with an assignment:
   `export { $n as g };` becomes `window.__psGSAP = $n;`.
3. Replace the entry's import of that export with
   `const X = window.__psGSAP;`.

Known trap: naive concatenation fails with
`Uncaught SyntaxError: Identifier 'Y' has already been declared`. Vite emits
top-level names that collide across chunks. Wrap each chunk in its own IIFE
block:

```js
(() => {
  /* core chunk, export swapped for window assignment */
})();
  /* entry chunk, import swapped for global read */
})();
```

## 4. Patch the mount code

The bundle locates its mount point and reads the URL hash. The caching entry
contained this block:

```js
const W = document.querySelector("#app");
if (W) {
  const u = document.URL.split("#")[1];
  if (u) { /* creates one <div data-id=hash> */ }
}
```

Delete the hash-router block. Then decide the page shape:

- Single animation: keep `<div id="app"></div>` and pre-create
  `<div data-id="<hash>"></div>` for one hash.
- Whole post (preferred): pre-create one container per hash, in blog order,
  inside styled sections. The bundle constructs every engine whose
  `[data-id="..."]` selector resolves; nothing else is needed. Animation code
  waits through `MutationObserver`, so containers may exist at load time.

Read the actual mount code in each new bundle. Three shapes exist so far:

1. Hash router with `data-id` containers (caching, io, sharding, btree): the
   entry creates one `<div data-id="<hash>">` from the URL hash. Delete the
   router block and pre-create one container per hash.
2. Hash dispatch into one container (doing-more-with-less): the entry calls
   one render function chosen by `location.hash`. Delete the dispatch and call
   every render function once, each with its own fresh wrapper `div`.
3. Some entries also inject their own `<style>` and body classes at mount;
   call the render functions, not the surrounding setup, more than once.


## 5. Add a minimal shell

Keep the bundle stylesheet as-is. Add only gallery chrome: page background, a
max-width column, one `<section>` per animation, and a small caption with the
hash name. Keep the original fonts links (`JetBrains Mono` for caching) so
typography matches the blog.

## 6. Verify

Headless Chrome is enough; no browser tooling required:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless \
  --disable-gpu --screenshot=out.png --window-size=1200,3000 \
  --virtual-time-budget=10000 "file:///path/to/result.html"
```

Check three things:

1. The DOM actually mounted. Dump it and confirm the `data-id` containers have
   generated children. An empty `#app` with a 2 KB screenshot means a JS
   error; rerun with `--enable-logging=stderr` and grep for `CONSOLE`.
2. No console errors.
3. Visual spot check against the live blog, several hashes at minimum.

The caching bundle adapts to `prefers-color-scheme`; headless defaults to
dark, so a dark screenshot is correct, not a bug.

## 7. Housekeeping

- Name the file `<slug>-article.html` in the post's reference folder
  (`references/<topic>/<slug>-article.html`).
- The file embeds PlanetScale's proprietary bundle code. Keep it out of the
  public `agent-skills` repository; it belongs in private repos only.
- Point the skill's `SKILL.md` at the new file when you add it.

## 8. Upstream bugs

Bundles ship bugs. The btree post's `#bplustree-inserts-nodes-visited` chart
throws `ReferenceError: parentId is not defined` — the minified class reads a
bare `parentId` where it means `this.parentId`. The bug reproduces on the live
blog; the demo is blank there too.

When a demo fails in your copy, diagnose in this order:

1. Serve the original vendored bundle and load the failing hash. If the
   original fails too, the bug is upstream.
2. Fetch the live bundle files and diff against the vendored copy. Confirm the
   live site has the same code. Do not assume the vendored copy is stale or
   that inlining caused the failure.
3. Patch the generated file only, with the smallest fix that restores the
   intended behavior. Keep the vendored source pristine so it stays a faithful
   copy of what the site serves.

Do not patch the vendored bundle. The generated file may deviate; the vendored
copy must not.
