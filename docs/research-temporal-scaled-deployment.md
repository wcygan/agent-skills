# Temporal scaled deployment: diagram audit

Reviewed October 1, 2026 against the current Temporal documentation, Temporal's
MySQL schema on `main`, Vitess 24 documentation, and PlanetScale's 2022 case study.
No specific Temporal release or running deployment was supplied. This checks the
explanation and simulation, not production compatibility or capacity.

## Result

The diagram's service scaling model is sound. Its Vitess/MySQL layer is an
optional integration example, not a Temporal-tested deployment configuration.
The page now states that distinction beside the diagram.

## Verified architecture

Frontend is stateless and routes inbound application calls. History owns
workflow state and logical History Shards; History process count can change
while the configured logical shard count stays fixed. Matching hosts Task
Queues. The internal Worker Service is another server component, separate from
application SDK workers. This simplified scene explicitly omits it. The shown
instance counts and symbolic H1–H12 labels are teaching choices, not sizing
advice. [Temporal Server documentation](https://docs.temporal.io/temporal-service/temporal-server).

Workers poll the service for tasks, rather than accessing persistence directly.
Task Queue partitioning is a separate dimension from History ownership and
physical database sharding. Four partitions are documented as the default;
the example ownership of Q0–Q3 across two Matching instances is illustrative.
[Temporal Task Queues](https://docs.temporal.io/task-queue).

The upper animation follows the simplified workflow lifecycle: Frontend routes
requests to History; persisted transfer tasks feed Matching; Matching asks
History to record task start; workers receive work and report completion through
Frontend. It is not a complete Activity, retry, or sticky execution simulation.
[Temporal workflow lifecycle](https://github.com/temporalio/temporal/blob/main/docs/architecture/workflow-lifecycle.md).

## Supplementary skill cross-check

The user-supplied `temporal:temporal-developer` skill (frontmatter version 0.6.2)
and its `references/core/determinism.md` agree with the diagram's application
model: SDK workers execute Workflow and Activity code, poll for tasks, and
report completion. Deterministic Workflow code can reconstruct execution state
by replaying recorded history; Activity implementations handle external effects.
The diagram's replay, crash recovery, and Activity behavior remain outside the
simulation, as stated in its scope.

This skill supplies application and replay guidance, not a Vitess deployment
validation or physical database sharding recipe. It does not change the
persistence findings below. No diagram changes were required by this cross-check.

## Persistence findings and corrections

Temporal persistence includes workflow history, mutable state, tasks, and
namespace metadata. MySQL is among its tested database families, but Temporal
explicitly excludes Vitess from its compatibility tests. The page therefore
identifies Vitess as optional and requires schema and version validation. The
scene omits Frontend metadata access and visibility paths; that is now explicit.
[Temporal persistence](https://docs.temporal.io/temporal-service/persistence).

VTGate accepts the MySQL protocol and routes queries to VTTablet servers.
Each MySQL instance has a corresponding VTTablet; the page clarifies that this
applies to replica cylinders too. Primary-to-replica arrows describe replication,
not extra write partitions.
[VTGate](https://vitess.io/docs/24.0/concepts/vtgate/),
[VTTablet and MySQL](https://vitess.io/docs/faq/getting-started/components/what-is-vttablet-how-does-it-work-with-mysql/).

PlanetScale documents a customer-specific Temporal deployment with sharded and
unsharded keyspaces and table-dependent Vindexes. It uses both `shard_id` and
`range_hash`; its historical table placement is not a universal schema recipe.
Migration involves copying data and switching traffic. The reshard control shows
the resulting topology only. [PlanetScale case study](https://planetscale.com/blog/temporal-workflows-at-scale-sharding-in-production).

Current Temporal MySQL schema likewise distinguishes shard-keyed workflow tables
from `range_hash`-keyed task queue tables, and includes newer queue tables absent
from the historical case study. Copying that VSchema unmodified would need a
release-specific review. [Temporal MySQL schema](https://github.com/temporalio/temporal/blob/main/schema/mysql/v8/temporal/schema.sql).

Contiguous H-number storage ranges could imply numeric range routing. The page
now shows symbolic, noncontiguous placement samples and explicitly says they
are not calculated by a real Vindex. Its simple grouping rule is a teaching
device; actual placement depends on the configured table keys and Vindexes.

## Verification limits

DOM checks cover independent scaling, reset, twelve preserved logical shard
labels, primary/replica counts, keyboard and mouse orbit, reduced motion,
autoplay, projected bounds, estimated text overlap, and arrowhead/shaft geometry.
They do not prove rendered pixel appearance or real server behavior. Browser
inspection of this local HTML page is blocked by the session's file-URL policy.

No Temporal server or Vitess cluster was deployed or load-tested. The diagram
does not establish transaction compatibility, failure recovery, operational
availability, or production sizing.
