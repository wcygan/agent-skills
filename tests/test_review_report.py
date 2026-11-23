"""The review-report renderer draws a valid review as an evidence page and names each problem in a broken one."""
import contextlib
import copy
import importlib.util
import io
import json
import os
import re
import subprocess
import sys
import tempfile
import unittest
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.dont_write_bytecode = True  # keep __pycache__ out of the distributable skill
SKILL = ROOT / "skills/review-report"
SPEC = importlib.util.spec_from_file_location("render", SKILL / "scripts/render.py")
render = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(render)

ACT_ON = {"severity": "act-on", "title": "Duplicate part", "location": "upload.py:88",
          "detail": "A second copy is stored.", "evidence": "I ran `pytest -k timeout`."}
CONSIDER = {"severity": "consider", "title": "No jitter", "detail": "Clients try again together."}
PROOF_GAP = {"severity": "consider", "proof_gap": True, "title": "No live test",
             "detail": "Only unit tests ran."}
LIVE = {"tool": "client", "command": "client@{version} upload big.bin", "input": "A 200 MB file",
        "before": {"version": "2.3.0", "result": "Upload fails", "output": "error: part 2 timed out"},
        "after": {"version": "2.4.0", "result": "Upload completes", "output": "uploaded big.bin"}}
AUTOMATED = {"level": "automated", "steps": ["The author ran `pytest`. All tests passed."]}


def review(**changes) -> dict:
    base = {
        "title": "Retry failed uploads",
        "target": "acme/storage#412",
        "problem": "A timeout fails the full upload. Users start again.",
        "intent": "The client tries a failed part again.",
        "picture": {"before": ["Client sends a part", "Upload fails"],
                    "after": ["Client sends a part", "Client tries again", "Upload completes"]},
        "proof": {"level": "live", "steps": ["I uploaded a 200 MB file. The upload completed.",
                                             "The author ran `pytest`. All tests passed."],
                  "live": copy.deepcopy(LIVE)},
        "changes": [{"kind": "changed", "what": "`upload_part` tries again", "detail": "Three times at most."}],
        "feedback": [CONSIDER, ACT_ON],
        "summary": "The second attempt stores a part twice.",
    }
    return base | changes


def run_main(argv: list[str]) -> tuple[int, str, str]:
    out, err = io.StringIO(), io.StringIO()
    with contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
        code = render.main(argv)
    return code, out.getvalue(), err.getvalue()


class FormatTests(unittest.TestCase):
    def test_the_skill_example_fits_the_format(self):
        example = json.loads(re.search(r"```json\n(.*?)```", (SKILL / "SKILL.md").read_text(), re.DOTALL).group(1))
        self.assertEqual(render.problems(example), [])

    def test_the_skill_documents_exactly_the_fields_the_script_accepts(self):
        text = (SKILL / "SKILL.md").read_text()
        fields, rest = text.split("## Fields")[1].split("Each feedback item:")
        feedback = rest.split("## Proof")[0]
        live = text.split("`proof.live` records")[1].split("## Writing rules")[0]

        def first_column(table: str) -> set:
            return set(re.findall(r"`(\w+)`", "\n".join(re.findall(r"^\| ([^|]+) \|", table, re.MULTILINE))))
        self.assertEqual(first_column(fields), render.REVIEW_KEYS)
        self.assertEqual(first_column(feedback), render.FEEDBACK_KEYS)
        self.assertEqual(first_column(live), render.LIVE_KEYS)

    def test_each_format_problem_is_named(self):
        broken = review(sumary="typo", url="javascript:alert(1)", changes=[], alignment=[],
                        feedback=[{"severity": "noted", "title": "", "detail": "x"}])
        self.assertEqual(render.problems(broken), [
            "unknown key `sumary`",
            "`url` must start with http:// or https://",
            "`changes` must be a list of one or more objects",
            "`alignment` must be a list of one or more non-empty strings; "
            "leave it out when no one else approved the change",
            "feedback 1: `severity` must be one of: act-on, consider",
            "feedback 1: `title` must be a non-empty string",
        ])

    def test_an_act_on_item_must_be_demonstrated(self):
        item = {"severity": "act-on", "title": "Race", "detail": "Maybe.", "untested": True}
        self.assertEqual(render.problems(review(feedback=[item])), [
            "feedback 1: an act-on item needs `evidence`",
            "feedback 1: an act-on item cannot be untested: test it, or file it as consider",
        ])

    def test_proof_without_a_live_test_must_be_flagged_in_feedback(self):
        self.assertEqual(render.problems(review(proof=AUTOMATED)), [
            'proof: level is automated, so add a feedback item with `"proof_gap": true` '
            "that names the missing live functional test"])
        self.assertEqual(render.problems(review(proof=AUTOMATED, feedback=[PROOF_GAP])), [])
        self.assertEqual(render.problems(review(feedback=[PROOF_GAP])), [
            "proof: level is live but a feedback item has `proof_gap`: change one or the other"])

    def test_a_live_level_must_record_the_run(self):
        proof = {"level": "live", "steps": ["I uploaded a file."]}
        self.assertEqual(render.problems(review(proof=proof)), [
            "proof: level is live, so record the run in `live`: the command and both outputs"])

    def test_a_live_run_must_be_complete_and_needs_a_live_level(self):
        live = copy.deepcopy(LIVE)
        live["command"] = "client upload big.bin"
        live["kind"] = "race"
        live["after"]["result"] = "The upload completes and the server stores every part"
        del live["before"]["output"]
        proof = AUTOMATED | {"live": live}
        self.assertEqual(render.problems(review(proof=proof, feedback=[PROOF_GAP])), [
            "proof live: it records a live run, so `proof.level` must be live",
            "proof live: `command` must hold `{version}` where the release goes",
            "proof live: `kind` must be one of: check, measurement",
            "proof live before: `output` must be a non-empty string",
            "proof live after: `result` has more than 8 words",
        ])

    def test_a_picture_must_be_short_and_show_a_difference(self):
        same = {"before": ["Client sends a part", "Upload fails"], "after": ["Client sends a part", "Upload fails"]}
        self.assertEqual(render.problems(review(picture=same)), [
            "picture: `before` and `after` are the same; show the step that changes"])
        self.assertIn("unknown key `sequence`", render.problems(review(sequence={})))

    def test_a_sentence_over_the_simplified_english_limit_is_named(self):
        long = " ".join(["word"] * 26) + ". A short sentence."
        self.assertEqual(render.problems(review(intent=long)), [
            'intent: a sentence has 26 words, the limit is 25; split "word word word word word..."'])
        self.assertEqual(render.problems(review(problem="One. Two. Three. Four.")), [
            "problem: has 4 sentences, the limit is 3; let the pictures show the rest"])


class PageTests(unittest.TestCase):
    def test_the_page_leads_with_the_verdict_then_problem_and_intent(self):
        page = render.render(review(), datetime(2026, 1, 2, 3, 4))
        self.assertIn('<p class="bottom c-bad">Request changes.</p>', page)
        self.assertLess(page.index("Request changes."), page.index("A timeout fails the full upload."))
        self.assertLess(page.index("A timeout fails"), page.index("The client tries a failed part again."))
        self.assertLess(page.index("The client tries"), page.index('class="meter"'))
        self.assertIn('<span class="chip gone">− Upload fails</span>', page)
        self.assertIn('<span class="chip new">+ Client tries again</span>', page)
        self.assertIn("Reviewed 2026-01-02 03:04", page)
        self.assertIn("color-scheme: light;", page)
        self.assertNotIn("prefers-color-scheme", page)

    def test_the_verdict_follows_from_the_feedback(self):
        self.assertEqual(render.verdict(review()), "request-changes")
        self.assertEqual(render.verdict(review(feedback=[CONSIDER])), "approve")
        self.assertIn('<p class="bottom c-good">Approve. Merge it.</p>', render.render(review(feedback=[CONSIDER])))
        self.assertIn("unknown key `verdict`", render.problems(review(verdict="approve")))

    def test_the_meter_counts_what_was_seen_reported_and_not_verified(self):
        data = review(feedback=[CONSIDER | {"untested": True}])
        self.assertEqual(render.evidence_lists(data), {
            "seen": ["I uploaded a 200 MB file. The upload completed."],
            "told": ["The author ran `pytest`. All tests passed."],
            "open": ["No jitter", "No person other than the author approved the change."]})
        page = render.render(data)
        self.assertIn('<div class="meter"><div class="seen" style="flex:1">1</div><div class="told" style="flex:1">1</div>'
                      '<div class="open hatch" style="flex:2">2</div></div>', page)
        aligned = render.evidence_lists(review(alignment=["Priya Shah approved it."], feedback=[]))
        self.assertEqual(aligned["open"], [])
        self.assertIn("Priya Shah approved it.", aligned["told"])

    def test_a_check_shows_the_run_failing_then_passing(self):
        page = render.render(review())
        self.assertIn('<pre class="out">client@{version} upload big.bin</pre>', page)
        self.assertIn('<div class="word c-bad">FAILS</div><span class="ver">client 2.3.0</span>', page)
        self.assertIn('<div class="word c-good">PASSES</div><span class="ver">client 2.4.0</span>', page)
        self.assertIn('<pre class="out before">error: part 2 timed out</pre>', page)
        self.assertIn('<pre class="out after">uploaded big.bin</pre>', page)

    def test_a_measurement_shows_before_and_after_not_fail_and_pass(self):
        data = review()
        data["proof"]["live"]["kind"] = "measurement"
        page = render.render(data)
        self.assertIn('<div class="tile before plain">', page)
        self.assertIn('<div class="word ">BEFORE</div>', page)
        self.assertIn('<div class="word c-good">AFTER</div>', page)
        self.assertNotIn("FAILS", page)

    def test_a_review_without_a_live_run_says_nobody_ran_it(self):
        data = review(proof=AUTOMATED, feedback=[PROOF_GAP])
        self.assertEqual(render.evidence_lists(data), {
            "seen": [],
            "told": ["The author ran `pytest`. All tests passed."],
            "open": ["No one ran the change in a real system.",
                     "No person other than the author approved the change."]})
        page = render.render(data)
        self.assertIn('<div class="word">NOT RUN</div><span class="ver">Automated tests only</span>', page)
        self.assertIn('<p class="none">The reviewer ran nothing.</p>', page)
        self.assertNotIn("PASSES", page)

    def test_feedback_shows_blocking_items_first_with_their_evidence(self):
        page = render.render(review())
        self.assertLess(page.index("Duplicate part"), page.index("No jitter"))
        self.assertIn('<span class="tag act-on">Act on</span>', page)
        self.assertIn("<dt>Evidence</dt><dd>I ran <code>pytest -k timeout</code>.</dd>", page)
        self.assertIn('<p class="none">No feedback items.</p>', render.render(review(feedback=[])))

    def test_review_text_cannot_inject_markup(self):
        page = render.render(review(title="<script>alert(1)</script>", url='https://example.com/"onclick="x'))
        self.assertNotIn("<script>", page)
        self.assertNotIn('"onclick="', page)


class CommandTests(unittest.TestCase):
    def test_the_command_writes_the_page_and_prints_its_path(self):
        with tempfile.TemporaryDirectory() as folder:
            source, out = Path(folder) / "review.json", Path(folder) / "out" / "page.html"
            source.write_text(json.dumps(review()))
            code, printed, _ = run_main([str(source), "--out", str(out)])
            self.assertEqual(code, 0)
            self.assertEqual(printed.strip(), str(out))
            self.assertTrue(out.read_text(encoding="utf-8").startswith("<!doctype html>"))

    def test_a_broken_review_writes_nothing(self):
        with tempfile.TemporaryDirectory() as folder:
            source, out = Path(folder) / "review.json", Path(folder) / "page.html"
            source.write_text(json.dumps(review(problem="")))
            code, _, errors = run_main([str(source), "--out", str(out)])
            self.assertEqual((code, errors), (1, "`problem` must be a non-empty string\n"))
            self.assertFalse(out.exists())

    def test_the_command_reads_and_writes_utf8_whatever_the_locale(self):
        with tempfile.TemporaryDirectory() as folder:
            source, out = Path(folder) / "review.json", Path(folder) / "page.html"
            source.write_text(json.dumps(review(title="Größe"), ensure_ascii=False), encoding="utf-8")
            env = os.environ | {"PYTHONUTF8": "0", "PYTHONCOERCECLOCALE": "0", "LC_ALL": "C"}
            done = subprocess.run(
                [sys.executable, "-B", str(SKILL / "scripts/render.py"), str(source), "--out", str(out)],
                env=env, capture_output=True, text=True)
            self.assertEqual(done.returncode, 0, done.stderr)
            self.assertIn("Größe", out.read_text(encoding="utf-8"))

    def test_a_missing_input_is_named_in_one_line(self):
        code, _, errors = run_main(["/nonexistent/review.json"])
        self.assertEqual(code, 1)
        self.assertEqual(errors, "cannot read /nonexistent/review.json: No such file or directory\n")

    def test_the_default_path_is_in_the_temporary_folder(self):
        path = render.default_path(review(), datetime(2026, 1, 2, 3, 4, 5))
        self.assertEqual(path.parent, Path(tempfile.gettempdir()) / "review-reports")
        self.assertEqual(path.name, "acme-storage-412-20260102-030405.html")


if __name__ == "__main__":
    unittest.main()
