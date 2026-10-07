---
name: system-design-interview
description: Coach system design interview practice, run mock interviews, and review architecture answers using scoped requirements, estimates, request flows, tradeoffs, and failure recovery. Use when preparing for a system design interview or practicing problems such as a URL shortener, rate limiter, or notification system.
---

# System design interview

Guide the user from requirements to a defensible architecture. Make one request work end to end, then justify additions with a concrete capacity, latency, correctness, or availability requirement.

## Choose the session

Use the requested mode: guided lesson, mock interview, or answer review. If unspecified, start a guided lesson. Use the user's problem; otherwise offer URL shortener for lookup flows, seat reservation for concurrent writes, or file storage for large transfers.

The self-contained visual library starts at [assets/index.html](assets/index.html). Open it when the user asks to browse examples or see diagrams. It works directly from disk without a server or network dependencies. Its common navigation links to:

- [assets/template.html](assets/template.html): a worked URL-shortener design using the five interview phases, with explicit practice assumptions, interfaces, and recovery choices.
- [assets/url-shortener.html](assets/url-shortener.html): codes, redirects, cache decisions, and storage failures.
- [assets/rate-limiter.html](assets/rate-limiter.html): atomic admission decisions, burst semantics, and outage policy.
- [assets/notification-system.html](assets/notification-system.html): durable acceptance, provider limits, and retry ambiguity.
- [assets/seat-reservation.html](assets/seat-reservation.html): concurrent reservations, expiry, and safe purchase retries.
- [assets/file-storage.html](assets/file-storage.html): large files, resumable transfers, and access control.
- [assets/direct-messaging.html](assets/direct-messaging.html): real-time connections, offline delivery, and ordering.
- [assets/following-feed.html](assets/following-feed.html): fanout, uneven traffic, and chronological pagination.
- [assets/document-search.html](assets/document-search.html): text matching, freshness, permissions, and deletion.
- [assets/applied-sharding.html](assets/applied-sharding.html), [assets/applied-partitioning.html](assets/applied-partitioning.html), [assets/applied-indexing.html](assets/applied-indexing.html), and [assets/applied-combinations.html](assets/applied-combinations.html): worked applications connecting read/write patterns to data placement and lookup choices.
- [assets/toolbox.html](assets/toolbox.html): optional infrastructure and its tradeoffs.

Read the selected example for its problem statement. Develop requirements and design decisions during the session. Treat any traffic figures introduced during practice as explicit assumptions, not measured limits. Reveal solution guidance during a mock interview only when feedback is requested or the session ends.

## Conduct the interview

1. **Clarify:** establish core actions, excluded features, callers, correctness requirements, latency goals, and availability needs. Completion: a bounded scope and explicit assumptions.
2. **Estimate:** calculate request rates, storage, bandwidth, or concurrency when they change a design decision. Use stated inputs and units; defer irrelevant arithmetic. Completion: relevant scale assumptions are explicit, and any calculation has a stated design implication.
3. **Sketch:** identify APIs, data keys, and a minimal request path. Trace both writes and reads, including response behavior. Completion: one successful request can be explained end to end.
4. **Deep dive:** pick the most consequential uncertainty. Explain the mechanism, triggering evidence, and cost of a proposed fix. Completion: the design addresses a concrete requirement rather than accumulating tools.
5. **Stress-test:** introduce higher load and a component failure. Trace visible behavior, retry safety, data loss or duplication, and recovery. Check object access, observable success/failure, and backup/restore needs where relevant. Completion: user-visible failure behavior, remaining limits, and recovery choices are explicit.

A 45-minute practice session can allocate 5, 3, 10, 17, and 10 minutes to these phases. Adapt to the user's available time. In mock mode, ask one question at a time and wait for the answer; supply requirements when asked and introduce follow-ups without revealing the solution. In guided mode, explain each decision with a small example before moving on.

## Give feedback

Assess scope clarity, numerical reasoning, request/data completeness, justified tradeoffs, and failure recovery. Mark each as demonstrated, partial, or missing with evidence from the user's answer. Separate an incorrect mechanism from a valid alternative design. End with the two highest-value improvements and one follow-up exercise. For answer reviews, finish the review before proposing further practice.

When a technical claim depends on a product-specific guarantee, verify it against current official documentation. Distinguish illustrative designs from deployable implementations; implementation requests retain their full authorized scope after the design phase.

When creating or revising any library diagram, read [references/diagram-structure.md](references/diagram-structure.md) before drawing. It governs semantic shapes, separate communication views, label spacing, connector geometry, and rendered verification.

When adding or revising library pages or toolbox concepts, follow [references/example-authoring.md](references/example-authoring.md) for page structure and mandatory toolbox priority ratings.
