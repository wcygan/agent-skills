# Assemble the review package

For the 300-line house target, visual examples, and compact execution evidence,
use the technical-visuals skill's pull-request design system and its gallery of
pull-request examples (cache, form retry, and queue). Treat the 300-line target as
a prompt to split; keep related tests with the change even when they push past it,
because a change without its tests is harder to review.

## Choose the visual by the reviewer question

| Question | Evidence or explanation |
| --- | --- |
| What relationship changed? | Small Mermaid or SVG before/after diagram |
| What does the user now see? | Actual application screenshots with comparable state and viewport |
| What order or failure path matters? | Numbered sequence or state transition figure |
| Is it faster? | Measured chart with workload, units, sample scope, and spread |
| What does a proposed design mean? | Explicitly labeled conceptual diagram or mockup |

GitHub Markdown supports Mermaid; other destinations may require an exported image.
Use repository conventions for assets. Do not put a local absolute path in a remote
PR body, because reviewers cannot open it. Prefer durable repository or hosted
assets the user has approved, and inspect the actual rendering and access after
publication. Avoid temporary preview URLs that expire before review. If hosting is
unavailable, prepare the asset locally and report the remaining publishing step
instead of claiming the image is visible remotely.

A screenshot of an HTML explanation is a legitimate illustration. Label it as an
illustration unless it depicts the actual application under test, because a
reviewer reads an unlabeled screenshot as evidence. Generated raster art cannot
substitute for a tested UI state or measured result for the same reason.

## Scenario diagrams

For meaningful testing scenarios, keep a scenario diagram visible when it helps
the reviewer follow the path under test. Borrow the presentation of the
technical-visuals pull-request examples, never their fictional results, because
results in a PR must be real. Use no fixed scenario count, and add no diagram
that conveys no useful information. A conceptual diagram is explanation; label
it so a reviewer does not mistake it for execution evidence.

## Good example: a bounded behavioral change

Illustrative PR body, assuming the named check was actually run:

> Requests for missing cache entries now read from the database instead of returning
> an empty result. Cache hits keep the existing path.
>
> [A small diagram shows lookup → hit → return, or miss → database read → return.]
>
> Validation: `pytest tests/test_cache.py` passes, including missing-key and hit cases.

Good because the trigger, outcome, preserved behavior, and evidence are explicit.
The visual explains branching; it does not repeat every implementation detail.
Replace the bracketed illustration with a real rendered artifact before publishing.

Bad:

> This PR introduces a robust caching optimization that leverages a streamlined
> architecture to significantly enhance reliability. Updated cache.py, service.py,
> and tests. All tests should pass.

Bad because the behavior is unspecified, adjectives replace evidence, the file list
adds little, and “should pass” disguises an unverified claim. Repair by naming the
trigger/result and reporting the actual check or the exact gap.

## Good example: no visual needed

> Correct the documented default timeout from 20 seconds to 30 seconds to match
> `DEFAULT_TIMEOUT`. Checked the constant and rendered the documentation page.

A diagram would add no useful relationship. Keep the text concise and accurate.

## Default structure when no template exists

Lead with a few sentences describing the problem and resulting behavior. Follow
with a visual and a short explanation of what it shows when that helps review.
Use an image table for a meaningful before-and-after comparison, or one image when
that is clearer. Omit decorative visuals. Keep material failures and risks visible
above the collapsed section.

Put the full description in a collapsed section with two H2 headings:

```markdown
<details>
<summary>Full description and validation</summary>

## Problem & Solution Overview

Scope, behavior, and relevant tradeoffs.

## Testing Done

Actual checks, results, and verification limits.

</details>
```

Put additional headings beneath these as `###` subsections. Confirm required PR
checks accept headings inside a disclosure; otherwise keep required headings visible
and collapse their supporting details. A required repository template overrides
this structure. Keep the PR concise and size images explicitly so they support the
explanation.

Do not hide failed checks behind a summary of passing ones, because the reviewer
decides on the failures. If the code changes after verification, renew affected
evidence. If a PR exists already, update its explanation around the final scope
rather than appending a chronology of revisions.
