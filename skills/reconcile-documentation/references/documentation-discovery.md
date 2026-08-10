# Documentation Discovery

Use this reference to find and classify documentation without assuming that a
project uses `docs/` or any particular toolchain.

## Follow the project's evidence

Apply discovery signals in this order:

1. **Explicit scope:** paths, packages, audiences, or documentation systems
   named by the user.
2. **Governing instructions:** repository and nested instruction files that
   define documentation ownership, validation, or generated-file policy.
3. **Tracked documentation:** version-controlled files and directories whose
   names, formats, or content indicate a human or agent documentation role.
4. **Documentation configuration:** navigation, site, generator, link-check,
   schema, task-runner, and CI configuration that names additional surfaces.
5. **Inbound pointers:** links or references from already confirmed
   documentation to package-local, hidden, generated, or externally published
   material.
6. **Change evidence:** modified source, configuration, schemas, commands, or
   layout that identifies documentation consumers even when their paths are
   unconventional.

Prefer version-control-aware enumeration such as tracked-file listings and the
repository's native search tool. Exclude dependency caches, build outputs,
temporary directories, and repository metadata unless configuration proves
that one contains an authoritative documentation artifact.

## Candidate signals

Treat these as leads, not a fixed allowlist:

- root and package-local `README*`, `CONTRIBUTING*`, `SUPPORT*`, `SECURITY*`,
  changelogs, upgrade guides, runbooks, playbooks, tutorials, examples, ADRs,
  specifications, and release instructions;
- documentation trees such as `docs/`, `doc/`, `documentation/`, guides,
  handbooks, wikis, or site content;
- Markdown, MDX, reStructuredText, AsciiDoc, notebooks, embedded help, and other
  formats connected to a known documentation build or audience;
- site and navigation configuration for systems such as MkDocs, Docusaurus,
  Sphinx, mdBook, VitePress, or a repository-specific generator;
- task definitions and CI jobs for documentation builds, link checks, example
  tests, schema generation, or publication;
- agent-facing instructions and skill trees, including `AGENTS.md`,
  `CLAUDE.md`, `.agents/skills/`, `.codex/skills/`, `.claude/skills/`, and
  repository-owned `skills/`; and
- API descriptions, schemas, CLI help sources, examples, templates, and
  generated references when documentation points to them.

Legal texts and security policies require their named owner and applicable
review process. Discovery may identify them; a generic documentation-update
request is not sufficient evidence to rewrite legal or security policy.

## Classify every surface

Assign one primary kind:

| Kind | Typical purpose | Default edit treatment |
| --- | --- | --- |
| User guide | Installation, concepts, tasks, reference | Editable in Update mode |
| Contributor guide | Setup, development, testing, release | Editable in Update mode |
| Operational guide | Runbooks, recovery, deployment, on-call procedures | Editable only with authoritative operational evidence |
| Normative contract | Specification, policy, ADR, compatibility promise | Authority candidate; do not assume it is stale |
| Agent instruction | Agent behavior, skills, repository instructions | Behavioral artifact; follow governing format and validation |
| Example | Runnable code, commands, fixtures, expected output | Editable; require example-specific proof |
| Generated reference | Output owned by a schema, source, or generator | Regenerate; do not hand-edit |
| Vendored or mirrored | Copy owned elsewhere | Read-only unless the repository defines a sync workflow |
| Published surface | Website, wiki, registry, or portal outside the checkout | External mutation requiring separate authority |
| Historical record | Changelog, archived plan, completed incident, old release | Preserve historical truth and time boundary |

Record both the file and its ownership chain. A Markdown file can still be
generated; a directory named `docs` can still contain normative specifications
or vendored material.

## Resolve nested and monorepo scope

For every candidate:

1. Find the nearest governing instructions and package boundary.
2. Identify whether the claim is local to one package, shared across packages,
   or repository-wide.
3. Follow navigation and build configuration to determine whether a file is
   published, included, orphaned, or duplicated.
4. Record which source tree, command surface, schema, service, or team owns the
   described behavior.
5. Keep identical words in different packages separate until shared semantics
   are proven.

A root README does not automatically own package-local details. A package
README does not automatically override a repository-wide policy. When nested
instructions conflict, apply the repository's instruction precedence and
preserve unresolved ownership as ambiguity.

## Bound a general audit

Prioritize by consequence and likelihood of drift:

1. setup, installation, migration, recovery, and destructive commands;
2. public interfaces, configuration, defaults, security, and data guarantees;
3. changed workflows, renamed paths, removed flags, and version claims;
4. runnable examples and expected outputs;
5. navigation, local links, and cross-document consistency; and
6. explanatory prose with no operational consequence.

State the stopping rule before scanning. Useful bounds include a named package,
documentation site, change window, claim class, maximum number of surfaces, or
time budget. Report both inspected and uninspected surfaces.

## Documentation Map template

| Key | Location | Audience | Kind | Authority role | Ownership | Validation | In scope because | Dirty state |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D1 | `README.md` | New users | User guide | Describes CLI surface | Project-owned source | Command help plus link check | Named setup change | Clean |

Discovery is complete only when each in-scope surface has a kind, owner, edit
treatment, and governing instruction set.
