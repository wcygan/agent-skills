---
name: principle-exhaust-the-design-space
description: "Apply when facing a novel UI interaction or architectural decision with no precedent in the codebase. Build 2-3 competing prototypes and compare side by side before committing."
license: MIT
metadata:
  kind: principle
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: afd51cf66a3100a95f878d6c4b93a01f6508e3b0
  upstream-path: pstack/skills/principle-exhaust-the-design-space
  upstream-author: Lauren Tan
  maintenance: local
---

# Exhaust the Design Space

**Trigger:** a novel UI interaction or an architectural decision with no precedent in the codebase, or a product choice where the right answer depends on feel rather than logic (how a gesture responds, how a layout reads, how a command line "feels" to type).

**Rule:** build two or three competing prototypes and compare them side by side before committing to one.

**Why:** with no precedent to copy, the first idea is a guess, and a guess built into production code is expensive to unwind. Two or three cheap prototypes cost less than one wrong production implementation, and comparing them exposes the tradeoff that reasoning alone misses, especially when feel is the deciding factor.

**When it does not apply:** the codebase already has a pattern for this (follow the pattern), the choice is reversible in minutes, or the options differ only in logic that a test can settle. Then decide and move on.

**How many:** two or three. One is not a comparison; more than three means the question is not yet narrowed, so narrow it first.

**Cost bound:** each prototype is throwaway: a static HTML page, a sketch in a scratch file, or a timeboxed spike of at most a few hours that is deleted afterward. If a prototype needs production wiring to be judged, the question is too big for this step; split it.

**What to compare on:**
- The experience: what the user sees, types, or waits for in each option, demonstrated, not described.
- The invariant each option protects and the failure each option makes impossible or easy.
- The cost to build the real thing and the cost to change it later.
- What each option forecloses: the next feature that becomes hard.

Put the options side by side in one place (one page, one table, one screen) so the comparison is visible rather than remembered.

**Who picks the winner:** when the question is product feel (how something looks, reads, or responds), the user picks; show the prototypes and ask. When the user is away or the run is unattended, pick one, state the reason, build on it in a way that is cheap to switch, and keep the other prototypes for the user to compare. For every other question the agent picks, states the reason in one or two sentences, and names what was given up. Never present one option as the only one considered when others were built.

**Stop gate:** do not start the production implementation of a novel design until the comparison exists, because every hour of production code written on an untested guess is an hour that a losing comparison throws away.

Related procedures by name: compare-solutions covers comparing competing solutions to a consequential artifact, and design-options covers architecture, ownership, and module-boundary decisions. This principle says when prototypes, rather than reasoning, are the right way to compare.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
