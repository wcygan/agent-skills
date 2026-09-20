# Deletion patterns

Use these patterns when a capability cut reaches shared or operational machinery.
Choose the applicable rows; they are candidate transformations, not a deletion
checklist that every run must exhaust.

| Opportunity | Cut and resulting simplification | Evidence needed |
| --- | --- | --- |
| Multiple formats or providers | Keep the selected implementation; delete unused adapters, factories, and dispatch. | Retained callers need only that implementation; remove obsolete options at their boundary. |
| Optional modes and flags | Fix the selected policy and remove its configuration path. | The chosen policy meets all retained scenarios; account for existing callers passing old options. |
| Scheduling or background work | Keep on-demand execution; delete exclusive job state and scheduling machinery. | Retained latency and execution requirements permit it; persisted jobs have a scoped disposition. |
| Retries and fallbacks | Use one attempt or one provider and propagate failure directly. | The retained failure contract permits this; account for partial effects and duplicate operations. |
| Validation and defensive checks | Remove checks for states made unreachable by the narrower contract. | A retained boundary or construction rule actually enforces the assumption at runtime. |
| Logging and telemetry | Delete instrumentation exclusive to removed capabilities; simplify remaining signals. | Retained diagnosis, audit, and recovery requirements remain satisfied. |
| Generic interfaces | Specialize parameters and data structures to the selected use case. | Search shared consumers; keep useful type information and required output fields. |

## Follow the deletion through the system

Trace a removed capability from its entrypoint through dispatch, implementation,
state, and exclusive dependencies. Then work back through callers, configuration,
tests, and documentation. A shared dependency stays while any retained consumer
needs it. Regenerate dependency lockfiles through the repository's tooling.

For a removed public option, choose its outcome explicitly: remove the reachable
surface or reject unsupported requests clearly. Silent reinterpretation of an
old request can produce a plausible but incorrect result.

Removing multi-tenant configurability does not by itself authorize removing access
isolation. Removing a retry loop does not prove its idempotency mechanism is
unnecessary when callers or transports can retry. Trace the guarantee's consumers,
not merely the code's proximity to a deleted feature.

When stored data, active jobs, or external consumers require migration or rollout,
identify that dependency before deleting the path they still need. Local code
editing does not authorize destructive changes to external state.

## Collapse the remainder

After specialization, look for forwarding helpers with no remaining policy,
interfaces with one trivial implementation, flags with one reachable value,
temporary state with one lifetime, and branches guarding removed modes.

Inline when it makes the retained operation easier to follow. Keep a helper when
its name expresses a useful rule, its implementation hides real complexity, or
inlining duplicates work. Select loops or pipelines according to clarity, ordering,
allocation, and short-circuit needs. Syntax density is not a success measure.

Preserve output shape deliberately. Replacing explicit field construction with
object spread can expose extra fields. Replacing a typed input with `any` hides
the contract. Optional chaining can turn an error into a silent empty result.
Treat each such difference as behavior requiring accounting, even if it saves lines.
