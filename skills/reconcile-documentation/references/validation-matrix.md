# Documentation Validation Matrix

Use this reference to select claim-specific proof and record reproducible
validation receipts.

## Match proof to the claim

| Changed claim | Preferred oracle | Focused proof | Broader proof |
| --- | --- | --- | --- |
| Command or flag | Registered command definition | Bounded help, parse, or dry-run check | CLI integration or example suite |
| Path or layout | Tracked filesystem plus packaging configuration | Existence and exact-reference search | Package or scratch-install test |
| API or schema | Normative contract or generator input | Schema/type validation or focused contract test | API documentation build or contract suite |
| Configuration or default | Parser, schema, and defaulting logic | Focused parse or configuration test | Configuration integration suite |
| Workflow or state | Executable graph, guards, and durable state contract | Focused state or scenario test | Workflow integration suite |
| Operational procedure | Approved runbook authority and deployed configuration | Static command/config verification | Existing recovery exercise evidence |
| Version or dependency | Manifest, lockfile, or release contract | Exact manifest and runtime comparison | Packaging or compatibility suite |
| Runnable example | Example source and promised outcome | Existing example harness or safe invocation | Tutorial or end-to-end suite |
| Local link or anchor | Tracked target and site navigation | Local link/anchor checker | Documentation site build |
| External link or fact | Current primary external source | Read-only availability and content check | Published-site check when authorized |
| Generated documentation | Owning generator input | Bounded regeneration and diff | Clean full generation check |
| Agent instruction or skill | Governing format and repository policy | Format/spec validator | Client discovery or scratch install |

Use the project's existing commands and fixtures before inventing a new check.
When no executable oracle exists, use exact static evidence and state what it
cannot prove.

## Preserve the validation authority boundary

Before running a command, determine:

- files and ignored artifacts it may write;
- services, containers, databases, browsers, or network endpoints it may use;
- whether it installs dependencies or changes a lockfile;
- whether it publishes, deploys, sends messages, or mutates external state;
- cleanup ownership and safe recovery; and
- the smallest focused mode that proves the claim.

Prefer validation already supported by the checkout. Do not broaden a
documentation update into environment repair, dependency installation, shared
service startup, production access, or publication. If the necessary proof is
unsafe or unavailable, retain the limitation in the report.

For commands shown to users, static source inspection alone may prove spelling
but not successful execution. Execute only safe read-only, help, validation, or
run-owned-fixture variants. Preserve placeholders for secrets and user-specific
values.

For external links or facts, use current primary sources when network access is
available and allowed. A successful HTTP response does not prove that the page
still supports the documented claim. If current primary content cannot be
read, classify the claim `external-unknown`.

## Validate in layers

Use this order so failures remain attributable:

1. **Claim reread:** compare the revised passage to the Claim Ledger.
2. **Focused semantic proof:** test the changed command, path, schema, example,
   workflow, or other claim against its authority.
3. **Structural proof:** validate formatting, frontmatter, schemas, local links,
   anchors, and navigation.
4. **Build proof:** run the narrowest documentation build that includes the
   changed surfaces.
5. **Discovery or packaging proof:** when applicable, verify that users or
   clients can still discover and install the artifact.
6. **Diff proof:** confirm every changed path is authorized and every changed
   line maps to an eligible claim key.

Do not substitute a later layer for an earlier one. A site build can pass while
commands are obsolete; a command can work while the page is unreachable.

## Handle generated documentation

Before regeneration:

1. prove which input owns the output;
2. inspect the generator command and bounded output paths;
3. confirm inputs are already authoritative and need no non-documentation edit;
4. snapshot dirty state for every output path; and
5. use a project-native no-publish mode.

After regeneration, inspect every changed path. A clean regeneration after the
patch is stronger evidence than comparing generated files byte-for-byte across
different tool versions. Record tool and runtime versions when they can affect
output.

## Record validation receipts

For every check record:

| Check | Claim keys | Command or inspection | Exit/result | Evidence proved | Limitation |
| --- | --- | --- | --- | --- | --- |
| V1 | C1 | `tool --help` | Exit 0 | Current flag spelling and argument | Does not prove full setup succeeds |

Classify failures as:

- **introduced:** the documentation patch caused or exposed the failure;
- **pre-existing:** the same bounded failure existed before the patch;
- **environment-blocked:** the necessary tool, dependency, service, or access is
  unavailable; or
- **unrelated:** the failure is outside the changed documentation and claim
  scope.

Report all four truthfully. Repair only introduced documentation failures in
this workflow. Do not edit unrelated implementation merely to obtain a green
check.

## Completion gate

Validation is sufficient only when:

- every changed claim has a semantic oracle or explicit limitation;
- structural checks cover every changed format;
- the relevant build, discovery, or packaging path passes when safely
  available;
- every changed path is authorized and accounted for;
- no generated or vendored artifact was hand-edited; and
- remaining failures and uncovered scope are visible in the final report.

A fully passing check suite is evidence, not a completeness claim. The final
report must still state the documentation surfaces and claim classes that were
not inspected.
