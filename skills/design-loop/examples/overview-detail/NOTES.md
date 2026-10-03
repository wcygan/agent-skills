# Overview with actionable detail

A standalone demo of the task: identify a failed preview build, inspect its cause,
and simulate recovery while confirming production remains healthy. It uses the
same neutral styling and shared shell geometry as Settings and Records, with its
own navigation, sample data, and browser storage.

Open `index.html` directly without build tooling, external assets, or network.
No real deployments run and no service or financial account is connected.

## Inspected inspiration (2026-10-03)

- [Vercel projects](https://vercel.com/docs/projects): project overviews expose
  production and preview deployments with status and commit detail.
- [Vercel deployment overview](https://vercel.com/docs/deployments/overview):
  deployment details and logs support debugging from the project overview.
- [Mercury balances](https://support.mercury.com/hc/en-us/articles/28767842120852-Understanding-your-Mercury-balances):
  distinguish summary categories with different meanings instead of combining
  them into one ambiguous total.

Mercury informs the explicit separation between actionable attention, live
production, and total deployments. Vercel informs the deployment domain and
summary-to-detail path. These are adapted principles, not copied layouts or
claims that Mercury has a deployment interface.

## Interaction contract

- Overview prioritizes failed previews, then healthy production, then recent activity.
  Three summary buttons open filtered deployments; there are no decorative charts.
- Deployments offers all, attention, production, and ready views. Each row opens
  its context, metadata, and sample build output in an accessible detail drawer.
- Activity opens the current deployment associated with an event. Historical events
  retain their original wording after a retry; details show the current state.
- A preview retry progresses from Failed to Building to Ready. Successful retries
  remove attention items, update counts, and add activity. Production stays unchanged.
- Close or Escape returns focus to the originating control, or the attention summary
  if recovery removed the row. A retry continues if the drawer is closed.
- Retry progress prevents duplicate retries. Ready and production deployments have
  no retry action. The local simulation assumes corrective configuration/code work;
  a live service must establish those prerequisites before reporting success.
- localStorage uses `design-loop:overview-detail:v1`. Successful preview states and
  new activity persist. Storage failure retains in-memory results and exposes retry
  in both the overview and open drawer.

## Review modes and limits

- `?view=wireframe`: grayscale structural mode with the same interactions.
- `?state=error`: the first preview retry fails; retrying it again succeeds.
- Recover both previews to see the clear attention state and empty attention filter.
- Initial times are fictional sample clock times; new events show “Just now”.

Shared shell: maximum width 1280px, desktop inset 32px, sidebar 180px, gap 64px,
and top offset 64px. At 760px and below, use 20px inset, 28px top offset, and
navigation above content. Details become full width on narrow screens.

Real services require actual build prerequisites, authorization, async cancellation
rules, log retrieval, server errors, polling, and persistence. The demo's Ready state
is simulated evidence, not verification of a real build or usability study.

## Release pipeline view

Deployments now leads with three inspectable sample release traces: a release
validated in staging and awaiting production, a failed artifact build with blocked
downstream stages, and a release fully deployed to production.

Each trace follows PR merged → version published → artifact generated → staging
deployed → production deployed. Stage buttons show completion, failure, or waiting;
details expose the PR, merge commit, version, artifact digest, and stage output.
The staging and production steps use the same immutable artifact rather than
rebuilding for each environment. Wide screens show the flow horizontally; smaller
screens stack stages in the same order.

Release traces are illustrative snapshots, independent of the earlier preview-build
simulation. Individual preview/production deployment records remain available under
an expandable section; summary drill-downs expand it automatically. Inspecting a
pipeline never merges, publishes, generates an artifact, promotes, or deploys.
Version publication means release/version metadata here; package publishing would
need its own explicit semantics in a real product. Digests are shortened sample IDs.
