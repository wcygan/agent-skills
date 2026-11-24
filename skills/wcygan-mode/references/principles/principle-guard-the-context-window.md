# Guard the Context Window

Apply when context is filling up: large outputs, long files, repeated reads, fan-out planning. Route bulk to subagents; keep summaries in the main thread, not raw payloads.

Keep raw payloads out of the main thread. Search for the symbol and read the matching region instead of the whole file, do not read a long file twice, and keep findings with evidence pointers (path and line, command and exit code), never the bulk.

Delegate only bounded work: a known set of files or commands and one question with a short answer. A delegate starts cold, so brief it with the question, the scope, and the return format with a size cap. Do not delegate what needs decisions from the main thread.

Apply a token or turn budget only when the user set one.

The test: could you lose the last 20 percent of your context and still state every decision made so far? If not, write the decisions down now.

Adapted from Lauren Tan's [Pstack principle](https://github.com/cursor/plugins/tree/afd51cf66a3100a95f878d6c4b93a01f6508e3b0/pstack/skills/principle-guard-the-context-window). [MIT license](../LICENSE.txt).
