---
name: review-report
description: "Review a change and deliver the result as one HTML evidence page in a temporary folder: the verdict first, then how much of the review was seen, the run before and after the change, and what nobody verified. Use for an HTML review report, a formatted or shareable pull request review, 'review this PR as a page', or when a code review should be read in a browser instead of the terminal."
license: MIT
compatibility: Requires Python 3.10 or newer to render the page and a browser to view it. The page loads one Google Font family and falls back to system fonts offline.
metadata:
  kind: component
  maintenance: local
---

# Review report

**Review the change with `review-changes`, write the result as data, and let the
script draw the page.** The page answers one question first: how much of this
review can the reader trust? It separates what the reviewer saw from what was
only reported and from what nobody verified. The script owns the HTML, so every
report looks the same.

1. Review the target with the [review-changes](../review-changes/SKILL.md)
   skill. If that review is already in the conversation for the same version of
   the change, use it instead of reviewing again. If the skill is unavailable,
   say so and stop; this skill formats a review and does not replace one.
2. Run the check. Run the same input on the release or commit before the change
   and on the one with it, and keep the real output of both runs. For a speed
   change, measure both and run a control input that the change does not
   target. See [Proof](#proof).
3. Write the review as JSON in a temporary file, using the [fields](#fields)
   and the [writing rules](#writing-rules).
4. Render it:

   ```sh
   python3 -B <skill dir>/scripts/render.py REVIEW.json --open
   ```

   The script prints the page's path, in a `review-reports` folder under the
   system temporary directory. Pass `--out FILE.html` to choose the path, and
   leave out `--open` when no browser is available. When the script lists
   problems, fix the JSON and run it again; it writes nothing until the review
   fits the format.
5. Reply with the verdict in one line and the page's path. Posting the review
   to the pull request speaks in the user's name, so it needs a go-ahead.

## The page

| Part | Drawn from | Shows |
| --- | --- | --- |
| Bottom line | `feedback` | Approve when no item is `act-on`, else Request changes. There is no verdict field. |
| Problem statement, Intent | `problem`, `intent`, `picture` | Each text above its flow. A step only in `before` is marked removed; a step only in `after` is marked added. |
| Meter | `proof`, `alignment`, `feedback` | A bar that counts what the reviewer saw, what was reported and not run again, and what was not verified. |
| The check | `proof.live` | The command, then the run before the change and the run with it, each with its real output. Without `proof.live` it says that no one ran the change. |
| Three lists | the same as the meter | The items behind each count. |
| Changes, Feedback, Verdict | `changes`, `feedback`, `summary` | The functional changes, each feedback item with its evidence, and the reason for the verdict. |

The script sorts the three lists:

- **Seen:** each proof step that does not start with "The author".
- **Reported:** each proof step that starts with "The author", and each
  `alignment` item.
- **Not verified:** the `note` of the live run, each feedback item with
  `untested`, a line when there is no live run, and a line when `alignment` is
  absent.

## Fields

| Field | Required | Holds |
| --- | --- | --- |
| `title` | yes | The change's title, such as the pull request title. |
| `target` | yes | What was reviewed: `owner/repo#12`, or `feature-x against main at 3f5028c`. |
| `url` | no | Link to the pull request or commit. |
| `problem` | yes | The problem or the reason for the change, at a high level. Not what the change does. Three sentences at most. |
| `intent` | yes | What the change does about the problem. Three sentences at most. |
| `picture` | yes | An object: `before` and `after`, each a list of 2 to 5 steps of 6 words or fewer. A step says what an actor does: "Client sends the part". Write a step that does not change with the same words in both lists. The lists must differ. |
| `alignment` | no | A list. Each item names a person or record, other than the author, that shows the change is sanctioned: a ticket, an approval, a decision in a thread. The author's own merge is not one. Leave it out for solo work. |
| `proof` | yes | An object: `level`, `steps`, and `live`. See [Proof](#proof). |
| `changes` | yes | A list of the high-level functional changes a reader must know about. Not a file list. Each change is an object: `kind` is `added`, `changed`, or `removed`; `what` names the change in 8 words or fewer; `detail` is optional and adds one or two sentences. |
| `feedback` | no | A list of items. Leave it out or use `[]` when there is none. |
| `summary` | yes | The reason for the verdict in one or two sentences. |

Each feedback item:

| Field | Required | Holds |
| --- | --- | --- |
| `severity` | yes | `act-on` for a substantiated issue that blocks acceptance, or `consider` for an improvement the author can decline. |
| `title` | yes | The failure or cost in a few words. |
| `location` | no | The smallest relevant changed line, as `path:line`. |
| `detail` | yes | The concrete failure or maintenance cost and its effect. |
| `evidence` | for `act-on` | What you saw that shows it: the path traced, the command run, the output. |
| `code` | no | A short snippet or output that goes with the evidence. |
| `fix` | no | The change you recommend. |
| `untested` | no | `true` for a hypothesis you could not check. An `act-on` item cannot be untested. |
| `proof_gap` | no | `true` on the item that reports a missing live functional test. |

Only **Act on** and **Consider** findings from `review-changes` go on the page.
Leave **Noted** and **Dismissed** findings out; mention one in the reply only
when the requester needs it.

## Proof

Proof shows that someone ran the changed behavior in a real, running system and
saw the result. Unit tests and other automated tests are not sufficient.

| `level` | Use when |
| --- | --- |
| `live` | The author or you ran the changed behavior end to end, such as the app, the command, or the request against a local instance, and saw the result. Needs `live`. |
| `automated` | The only evidence is automated tests, a build, or a linter. |
| `none` | There is no test evidence. |

- Each item in `steps` says who ran it, what they ran, and what they saw. Start
  a step with "The author" when the author ran it and you did not run it again.
- When the level is `automated` or `none`, add a feedback item with
  `"proof_gap": true`. In it, name the live test that is missing and give the
  steps to run it in `fix`. Use `act-on` when the change affects behavior a user
  or a caller can see. Use `consider` when a live run is not possible or the
  change cannot affect behavior, and say why.
- Do not record `live` for a test you or the author did not run.

`proof.live` records one before-and-after run of the same input:

| Field | Holds |
| --- | --- |
| `tool` | The name of what ran, such as `ruff` or `my-service`. |
| `command` | The command, with `{version}` where the release or commit goes. |
| `input` | The input both runs used, in a few words or as code. |
| `before`, `after` | Objects: `version` (the release or commit), `result` (8 words or fewer), and `output` (the real output, copied as it printed). |
| `kind` | Optional. `check` (default) when the run fails before the change and passes with it. `measurement` when both runs succeed and the result is a number, such as a time; the page then shows before and after, not fail and pass. |
| `note` | Optional. A limit of the comparison, such as a "before" taken from another release line, or other changes in the same release. |

## Writing rules

Write every field in ASD-STE100 Simplified Technical English:

- Keep a sentence to 25 words or fewer, and an instruction to 20. The script
  refuses a longer sentence.
- Give one idea in each sentence. Give one instruction in each sentence.
- Use the active voice. Use the simple present, the simple past, or the
  imperative.
- Use one word for one meaning, and the same name for the same thing each time.
- Keep the articles and the subject. Write "the script reads the file", not
  "reads file".
- Do not use idioms, metaphors, filler, or hedges. Do not use a verb in its
  `-ing` form as a noun when a noun exists.

Text fields take plain text. Backticks mark `code`; other markup is shown as
typed.

## Example

```json
{
  "title": "Retry failed uploads",
  "target": "acme/storage#412",
  "url": "https://github.com/acme/storage/pull/412",
  "problem": "A network timeout during a multipart upload fails the full upload. Users must start large uploads again.",
  "intent": "The client tries a failed part again, with a delay that increases after each attempt.",
  "picture": {
    "before": ["Client sends a part", "Network times out", "Upload fails"],
    "after": ["Client sends a part", "Network times out", "Client sends the part again", "Upload completes"]
  },
  "alignment": [
    "Ticket STOR-88 records the request from the support team.",
    "Priya Shah approved the design in the ticket."
  ],
  "proof": {
    "level": "live",
    "steps": [
      "I uploaded a 200 MB file to a local server and stopped the network for 5 seconds.",
      "The author ran `pytest tests/test_upload.py`. All 14 tests passed."
    ],
    "live": {
      "tool": "storage-client",
      "command": "storage-client@{version} upload big.bin --drop-network 5s",
      "input": "A 200 MB file with a 5 second network stop",
      "before": {"version": "2.3.0", "result": "Upload fails", "output": "error: part 2 timed out"},
      "after": {"version": "2.4.0", "result": "Upload completes with 3 parts", "output": "uploaded big.bin (3 parts)"}
    }
  },
  "changes": [
    {
      "kind": "changed",
      "what": "`upload_part` tries a failed part again",
      "detail": "It tries three times at most, with a longer delay each time."
    },
    {"kind": "added", "what": "A `max_attempts` setting", "detail": "It controls the number of attempts."}
  ],
  "feedback": [
    {
      "severity": "act-on",
      "title": "A second attempt sends a part that the server already stored",
      "location": "storage/upload.py:88",
      "detail": "A timeout can occur after the server stores the part. The second attempt then stores a second copy.",
      "evidence": "The live upload with version 2.4.0 completed with 3 parts, not 2.",
      "fix": "Send the part number as an idempotency key."
    }
  ],
  "summary": "The upload no longer fails, but a second attempt stores a part twice."
}
```
