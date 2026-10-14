# Clear technical communication

Optimize for correct understanding, not the fewest possible words. Keep one term
for each concept. Use active voice when the actor matters, put a condition next to
its action, and distinguish observed results from expectations. These are practical
editing principles inspired in part by ASD-STE100; this skill does not implement
its controlled dictionary or claim formal STE compliance.

[ASD-STE100 overview](https://www.asd-ste100.org/about_STE.html) describes the writing
rules and controlled vocabulary. Consult the official standard if formal compliance
is requested; do not label ordinary concise prose as certified or compliant.

## Before and after

| Context | Weak | Better | Why |
| --- | --- | --- | --- |
| PR summary | Improve robustness through enhanced retry handling. | Retry a timed-out request up to three times, then return the timeout error. | Names trigger, bound, and outcome |
| Evidence | Tests should pass. | `pytest tests/test_retry.py` passed, including retry exhaustion. | Distinguishes an observation from a prediction; use only if actually run |
| Instruction | The cache should be cleared if stale values are encountered. | If a cached value is stale, remove that entry before retrying. | Keeps condition and action together; specifies scope |
| Diagram label | Data processing subsystem | Worker | Uses the smallest accurate role name |
| Edge label | Communication | Replicate write | Names the relationship |
| Caption | New architecture | A miss reads the database; a hit returns the cached value. | Explains what the reader should notice |
| Performance | Much faster now. | In this workload, median latency fell from 80 ms to 55 ms. | Bounds the claim; include measurement context and spread where needed |
| Limitation | Mostly verified. | Keyboard navigation passed; touch interaction was not tested. | Identifies the actual gap |

Numbers and commands above are illustrative, not measured repository results.
Never copy them into a delivery report without supporting evidence.

## Preserve meaning while shortening

Bad shortening: “Retries make writes safe.”
Better: “Retries can duplicate a write unless the handler deduplicates requests.”
The second sentence is longer because the condition is part of the meaning.

Bad synonym variety: call the same component a worker, processor, executor, and
runner within one explanation. Choose the term used by the interface and keep it.
Do not replace exact API names with friendlier words that prevent source lookup.

A label names; a caption explains; supporting prose qualifies. Avoid putting a
paragraph into every node or repeating the caption as a paragraph immediately below.
For complex work, link details rather than deleting information needed for review.

## Editing pass

Read the title, first sentence, figure, and caption in isolation. Can the intended
reader identify the action or change? Then check every substantive claim against its
evidence and restore any qualification lost during editing. Do not impose fixed
sentence lengths when they make the technical meaning harder to understand.
