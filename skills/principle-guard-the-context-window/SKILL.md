---
name: principle-guard-the-context-window
description: "Apply when context is filling up: large outputs, long files, repeated reads, fan-out planning. Route bulk to subagents; keep summaries in the main thread, not raw payloads."
license: MIT
metadata:
  kind: principle
  upstream-repository: https://github.com/cursor/plugins
  upstream-revision: afd51cf66a3100a95f878d6c4b93a01f6508e3b0
  upstream-path: pstack/skills/principle-guard-the-context-window
  upstream-author: Lauren Tan
  maintenance: local
---

# Guard the Context Window

**Trigger:** context is filling up. Concrete signals: a file over about 500 lines you are about to read whole; the same file read a second time; a command whose output runs to hundreds of lines; a plan that fans out over about five or more units (files, modules, test suites, repositories).

**Rule:** keep raw payloads out of the main thread. Read narrowly, summarize locally, and delegate only bounded work: a bounded read with one clear question. Keep findings and evidence pointers in the main thread; never the bulk.

**Why:** a full context degrades reasoning, loses early decisions to compression, and eventually halts progress. Each raw payload in the main thread is paid for on every later turn.

**Cost of delegating:** a delegate starts cold. It re-derives context you already hold, may read files you already read, and its result arrives as text you must trust or re-check. Delegation that saves you 200 lines of reading but costs the delegate 2,000 lines of re-discovery is a loss unless those 2,000 lines would otherwise have landed in your context.

**When it pays:** the work is bounded (a known set of files or a known command), it has one clear question with a short answer (a list of locations, a yes/no with evidence, a table of counts), and the delegate does not need decisions from the main thread to finish. A sweep over a large directory for every caller of a function qualifies. "Figure out how the auth system works" does not; narrow it first.

**When delegation is unavailable:** narrow the read (search for the symbol, read the matching region, not the file), summarize what you learned in a few lines, and move on. Do not read a long file twice; write the facts you need from it the first time.

**How to brief a delegate:** three parts.
- **Question:** the one thing to answer, in a sentence.
- **Scope:** which files, directories, or commands to read; what not to touch.
- **Return format:** what shape the answer takes (file paths with line numbers, a count, a short list), and a size cap on the reply.

**What stays in the main thread:** the finding in one or two sentences, and evidence pointers (file path and line, command and exit code, the artifact's location) so a reviewer can reopen the evidence without re-running the delegate. The raw transcript, the full file, and the full command output stay out.

**Size phases and cap scope:** limit the files and questions in each phase, and account for the cost of the mechanism itself (a delegate briefing, a tool's own output) when planning. Apply a token or turn budget only when the user set one, because a self-imposed budget becomes a reason to stop early.

**Test:** could you lose the last 20 percent of your context and still state every decision made so far? If not, the decisions are living in raw payloads instead of summaries; write them down now.

The human analog is minimize-reader-load: working memory is finite for readers too.

Adapted from pstack; [license and attribution](references/LICENSE.txt).
