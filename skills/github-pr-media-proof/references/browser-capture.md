# Browser capture with Playwright CLI

Use `playwright-cli` as the sole browser capture tool. Use the vendored skill for its complete command contract.

## Preconditions

1. Confirm that the application URL is reachable.
2. Run `playwright-cli --version`.
3. Require version 0.1.18 or newer for reliable nonzero error exits.
4. Use an existing installation. Obtain authorization before a global install or upgrade.
5. Create a temporary proof directory outside the product repository.

Playwright CLI creates `.playwright-cli` runtime files. Keep this directory and all proof media out of product commits.

## Capture a screenshot

Open a named session from the proof directory. Set the required viewport before capture.

```sh
playwright-cli -s=pr-proof open http://127.0.0.1:3000
playwright-cli -s=pr-proof resize 1280 800
playwright-cli -s=pr-proof screenshot --filename=after.png
```

Capture before and after images only when both states can use the same viewport, data, and scenario.

## Capture a reviewer video

Use a short deterministic scenario. Prefer a `run-code` hero script with Playwright locators and observable waits.

```sh
playwright-cli -s=pr-proof video-start overview.webm
playwright-cli -s=pr-proof video-chapter "Changed behavior"
# Run the prepared scenario.
playwright-cli -s=pr-proof video-stop
```

Use chapter cards to orient the reviewer. Use action callouts only when the interaction is otherwise unclear.

## Verify and recover

1. Confirm that each command returned success.
2. Check console errors after the scenario.
3. Stop the recording before closing the session.
4. Run the upload script with `--dry-run` to inspect codecs, dimensions, and sizes.
5. Close the named session after artifact verification.

If a command fails, run `playwright-cli list` and inspect the session with `playwright-cli show`. Close the named session and retry once. Use `kill-all` only when the Playwright CLI processes do not respond.

The capture is complete only when the expected image or video exists, the upload dry-run accepts it, and the product repository excludes all runtime artifacts.
