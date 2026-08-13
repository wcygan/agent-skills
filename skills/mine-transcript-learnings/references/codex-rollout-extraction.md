# Codex Rollout Extraction

Use this reference after the scan contract identifies a Codex rollout corpus.
It covers candidate selection, compacted messages, and extraction diagnostics.
Resolve `scripts/extract_transcript_evidence.py` from the installed skill root.
The command examples assume that directory is current.

## Select candidates in two phases

Run the extractor help before the first unfamiliar use:

```bash
python3 scripts/extract_transcript_evidence.py --help
```

Start with metadata. Keep every user-supplied file and byte bound:

```bash
python3 scripts/extract_transcript_evidence.py \
  --cwd /path/to/repository \
  --since 2026-08-13 \
  --until 2026-08-13 \
  --max-files 10 \
  --max-bytes 26214400 \
  --max-event-chars 8000 \
  --metadata-only
```

The metadata pass identifies paths, thread identifiers, working directories,
snapshot sizes, and timestamp sources. It does not read event content.

Run content extraction against the selected paths. Use repeatable markers when
one transcript must contain every durable identifier:

```bash
python3 scripts/extract_transcript_evidence.py \
  /path/to/first-rollout.jsonl \
  /path/to/second-rollout.jsonl \
  --since 2026-08-13 \
  --until 2026-08-13 \
  --max-files 10 \
  --max-bytes 26214400 \
  --max-event-chars 8000 \
  --require-text marker-one \
  --require-text marker-two
```

Every marker must occur somewhere in sanitized observable event text. Hidden
reasoning cannot satisfy a marker. `--no-tools` also excludes tool output from
marker matching. Marker values are not copied into scan summary records.
Use only nonsecret durable identifiers because command arguments remain visible.

Candidate limits apply before marker matching. A zero match is incomplete when
the scan reports a file or byte limit skip.

## Choose the time boundary

Use date-only bounds for a named calendar day. The extractor compares rollout
filename dates and includes the complete final day.

Use offset timestamps for a precise instant range. The extractor uses the
`session_meta.timestamp` value when available. It reports `filename_date` or
`modified_at` when metadata cannot supply the timestamp.

Inspect these scan fields before changing the bounds:

- `time_filter_mode` states `calendar_date` or `timestamp`.
- `timestamp_sources` counts each source used during selection.
- `skipped_time` counts files outside the selected window.
- `skipped_cwd` counts files outside the requested working directory.
- `skipped_file_limit` and `skipped_byte_limit` expose incomplete discovery.

Keep a calendar-day request as date-only bounds. Use precise timestamps only
when the request needs an instant boundary.

## Inspect message sources

Codex rollouts can store observable messages in two forms:

- `response_item` is the primary message representation.
- `event_msg` is the fallback representation retained by some compacted runs.

The default `--message-source auto` keeps primary messages and adds fallback
messages that have no paired cross-source duplicate. It preserves duplicates
within one source.

Use another policy only when the evidence requires it:

- `primary` emits only `response_item` messages.
- `fallback` emits only `event_msg` messages.
- `all` emits both sources and retains cross-source duplicates.

Tool calls and tool output remain controlled by `--no-tools`. Message records
include `message_source`. Transcript summaries include:

- `primary_messages`;
- `fallback_messages`;
- `cross_source_duplicates`;
- `compaction_records`; and
- `message_source_policy`.

Use `all` when repeated identical messages or source pairing affects the claim.
Review the sanitized output before adding any content to the evidence ledger.

## Handle compaction

Compaction can remove earlier tool output while retaining observable messages.
It can also assign one later timestamp to several retained messages.

Use record ordinals for sequence when timestamps collapse. Keep the reported
timestamp, but do not treat it as the original event time.

Classify an assistant-only fallback claim as `observed`. Upgrade it to
`verified` only when a retained tool result, durable state, test, or user
confirmation proves the same result.

Never inspect hidden reasoning to replace missing evidence. Use current durable
state when it can verify the historical claim without changing the target.

## Diagnose incomplete selection

| Signal | Meaning | Next read-only check |
|---|---|---|
| `selected_files` is zero | No candidate passed time, working-directory, and resource filters. | Inspect time mode, timestamp sources, and skip counts. |
| `matched_files` is zero | No selected candidate contained every observable marker. | Check marker spelling, message policy, tool inclusion, and resource skips. |
| `compaction_records` is positive | Earlier observable evidence can use fallback messages or reduced timestamps. | Compare `auto` with `all` and use ordinals. |
| `fallback_messages` exceeds emitted fallback messages | Cross-source duplicate pairing removed repeated copies. | Use `all` when source identity matters. |
| `unknown_records` is non-empty | The rollout schema contains an unsupported record type. | Inspect only its type label; stop before unsafe content parsing. |

Stop when safe observable extraction cannot identify one transcript, separate
message sources, or support the required evidence class.
