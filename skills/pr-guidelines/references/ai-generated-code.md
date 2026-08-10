# AI-Generated Change Review

Apply this path only when AI generation is explicit. Never infer it from prose or coding style.

## Before generation or restructuring

- Design the stack before generating code.
- Put prerequisites and shared foundations at the bottom.
- Give each layer one coherent intent and a test boundary.
- Generate and verify bottom-up so descendants consume reviewed foundations.

## Review checks

### Intent and context

- The PR explains the real problem, not merely the prompt or generated files.
- The solution respects repository architecture and local conventions.
- Requirements, constraints, and non-goals are visible to reviewers.

### Correctness evidence

- Relevant tests, static analysis, and manual scenarios were actually run or explicitly not run.
- Deleted, weakened, skipped, or snapshot-updated tests are called out.
- Public APIs, library methods, flags, and configuration keys exist in authoritative sources.
- Edge cases and failure paths were considered, not just the happy path.

### Code quality

- Generated abstractions solve a current need and do not duplicate existing utilities.
- Error handling is deliberate; failures are not silently swallowed.
- Comments explain decisions rather than narrating syntax.
- Dead code, placeholder logic, debug output, and prompt artifacts are absent.

### Dependencies and provenance

- New dependencies are necessary, maintained, license-compatible, and pinned according to repository policy.
- Generated or copied material has acceptable provenance and attribution.
- Secrets, private data, and unsafe generated configuration are absent.

### Human oversight

- A human or accountable reviewer can explain the change and its operational risk.
- The PR description identifies meaningful uncertainty rather than overstating confidence.
- Each stack layer is self-reviewed before descendants are built on it.

## Fix ownership in a stack

Put a correction in the lowest layer that logically owns it, then rebase descendants upstack. Do not patch the same defect independently in several PRs.

## Output additions

Add an `AI review` line containing:

- trigger evidence for using this path;
- strongest verified assurance;
- highest unresolved AI-specific risk;
- the accountable next review action.

The presence of AI-generated code is neither a failure nor proof that the PR should be split.
