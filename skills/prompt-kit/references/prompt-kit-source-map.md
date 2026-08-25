# PromptKit Source Map

Use this map to choose evidence before answering a PromptKit request. Keep
exact props and dependency versions in the live source. This file records
routing rules and durable source precedence.

## Source precedence

1. **Current PromptKit page** — Use the matching `/docs/...` page for concepts,
   examples, and documented behavior.
2. **PromptKit registry item** — Use `https://prompt-kit.com/c/name.json` for
   exact files, registry dependencies, package dependencies, and environment
   variables.
3. **PromptKit repository source** — Use the
   [GitHub repository](https://github.com/ibelick/prompt-kit) when page prose and
   registry data differ.
4. **Machine-readable indexes** — Use [`llms.txt`](https://www.prompt-kit.com/llms.txt)
   for discovery and [`llms-full.txt`](https://www.prompt-kit.com/llms-full.txt)
   for bulk orientation.
5. **Site discovery files** — Use [`robots.txt`](https://www.prompt-kit.com/robots.txt)
   and [`sitemap.xml`](https://www.prompt-kit.com/sitemap.xml) to find same-domain
   pages. Treat them as discovery evidence, not API authority.
6. **Supporting references** — Use [shadcn/ui](https://ui.shadcn.com/docs),
   [React](https://react.dev/), [Next.js](https://nextjs.org/docs),
   [Tailwind CSS](https://tailwindcss.com/docs), and [AI SDK](https://ai-sdk.dev/docs)
   only for framework or dependency semantics.

## URL map

| Need | Canonical route | Use |
| --- | --- | --- |
| Overview | `/docs/introduction` | Project purpose and scope |
| Setup | `/docs/installation` | Node, React, shadcn, and CLI setup |
| Component API | `/docs/name` | Examples, API tables, and documented caveats |
| Component registry | `/c/name.json` | Files and dependency metadata |
| Blocks | `/blocks` and `/c/block-slug` | Complete compositions and source previews |
| Canonical chat example | `/c/full-chat-app` | Baseline composition for a complete chat UI |
| Primitives | `/primitives` and `/p/name` | Feature-level UI and API routes |
| Showcase | `/docs/showcase` | Integration examples |
| Machine index | `/llms.txt` | Short catalog and source links |
| Machine corpus | `/llms-full.txt` | Bulk documentation for orientation |

## Installation evidence

Use [`/docs/installation`](https://www.prompt-kit.com/docs/installation) as
the authority for prerequisites and commands. The current crawl documented
Node 18 or newer, React 19 or newer, a configured shadcn project, and this
component command:

```sh
npx shadcn add "https://prompt-kit.com/c/<name>.json"
```

Use the project's package runner in place of `npx`. Recheck the page before
implementation because prerequisites and registry metadata can change.

The site may redirect between `prompt-kit.com` and `www.prompt-kit.com`. Keep
the final evidence links on the canonical host returned by the request.

## Resolve a request

1. Identify the requested surface and its name.
2. Open the matching PromptKit page.
3. Open the registry JSON when installation or dependencies matter.
4. Open the repository source when the page, registry, and local code disagree.
5. Open supporting references only for the unresolved framework detail.
6. Record the URL, source type, and retrieval date for each material claim.

## Source gaps

- `llms-full.txt` is a partial bulk reference. Compare it with `llms.txt` and
  the sitemap before claiming full catalog coverage.
- The sitemap can contain stale entries, including `/docs/page.tsx`.
- Some block routes render HTML previews and source without a `.json` registry
  item. Inspect the route before constructing an install command.
- Registry metadata can change independently from page prose. Prefer current
  registry data for dependencies and file lists.
- A primitive registry item can add both React files and an API route. Inspect
  `envVars` and route files before recommending installation.

## Evidence record

For every answer, record:

- selected PromptKit surface;
- canonical page or registry URL;
- source type and retrieval date;
- dependency and environment evidence;
- conflicts, gaps, and assumptions;
- local validation result when code changes are requested.
