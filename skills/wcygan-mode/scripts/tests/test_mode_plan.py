from pathlib import Path
import sys
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from check_plan import validate

PLAN = """# Work
## Goal
Preserve column order.
## Scope
Export module.
## Completion
Output order matches input.
## Unit first
Status: pending
Depends on: none
Write scope: export.py
Acceptance: Column order matches the request.
Verification: Run export and inspect the produced file.
Evidence: pending
"""


class PlanTests(unittest.TestCase):
    def test_valid_and_optional_perf(self):
        self.assertEqual(validate(PLAN), [])
        self.assertEqual(
            validate(
                PLAN + "Performance: Compare median export time against baseline.\n"
            ),
            [],
        )

    def test_missing_and_duplicate_fields(self):
        self.assertTrue(
            validate(
                PLAN.replace(
                    "Verification: Run export and inspect the produced file.",
                    "Verification: TBD",
                )
            )
        )
        self.assertTrue(validate(PLAN + "Status: complete\n"))
        self.assertTrue(validate(PLAN.replace("## Goal", "## Purpose")))

    def test_dependencies_and_cycles(self):
        self.assertTrue(
            validate(PLAN.replace("Depends on: none", "Depends on: absent"))
        )
        self.assertTrue(validate(PLAN.replace("Depends on: none", "Depends on: first")))
        second = (
            PLAN[PLAN.index("## Unit") :]
            .replace("first", "second")
            .replace("Depends on: none", "Depends on: first")
        )
        self.assertEqual(validate(PLAN + second), [])
        self.assertTrue(validate(PLAN + PLAN[PLAN.index("## Unit") :]))
        self.assertTrue(
            validate(PLAN.replace("Depends on: none", "Depends on: second") + second)
        )

    def test_completed_evidence_and_incomplete_parent(self):
        with tempfile.TemporaryDirectory() as temp:
            done = PLAN.replace("Status: pending", "Status: complete").replace(
                "Evidence: pending", "Evidence: [proof](proof.txt)"
            )
            self.assertTrue(validate(done, temp))
            Path(temp, "proof.txt").write_text("observed output")
            self.assertEqual(validate(done, temp), [])
            self.assertTrue(
                validate(
                    PLAN
                    + done[done.index("## Unit") :]
                    .replace("first", "second")
                    .replace("Depends on: none", "Depends on: first"),
                    temp,
                )
            )

    def test_fenced_examples_and_longer_closers(self):
        example = "\n~~~markdown\n## Unit fake\nStatus: complete\n~~~~\n"
        self.assertEqual(validate(PLAN + example), [])
        self.assertTrue(validate(PLAN + "\n```\nunterminated"))
        self.assertEqual(
            validate(PLAN + "\n````markdown\n```\n## Unit fake\n`````\n"), []
        )
