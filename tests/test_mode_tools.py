"""Include the distributed mode tools in the repository's shared test gate."""

import importlib.util
import sys
from pathlib import Path
import unittest


def load_tests(loader, tests, pattern):
    sys.dont_write_bytecode = True
    directory = Path(__file__).resolve().parents[1] / "skills/wcygan-mode/scripts/tests"
    if not directory.is_dir():
        return tests
    suite = unittest.TestSuite([tests])
    for path in sorted(directory.glob("test_mode_*.py")):
        spec = importlib.util.spec_from_file_location(path.stem, path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        suite.addTests(loader.loadTestsFromModule(module))
    return suite
