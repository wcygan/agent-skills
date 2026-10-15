# fix: preserve form inputs when saving fails

## Problem & Solution Overview

A failed save clears the edited profile. Retain the draft and offer Retry so the user can submit again without retyping.

<img src="assets/retry.svg" alt="Profile draft goes to the save API. A 503 retains the draft; a 200 confirms it was saved." width="448">

## Testing Done

> Illustrative transcripts for fictional applications. These commands and outputs are examples, not an executed test run.

<details>
<summary>Local setup</summary>

```sh
npm ci
npm run dev
```

Use an isolated profile fixture. Enter “Mira Chen” in /profile. The test routes below control the response for each scenario.

</details>

### Successful save

<img src="assets/retry-success.svg" alt="The API returns 200 and the profile is saved." width="448">

<details>
<summary>Commands and results</summary>

Click Save with the profile endpoint available. Confirm the saved name after reloading.

```sh
npx playwright test tests/profile-retry.spec.ts --grep "successful save"
```

```text
PATCH /api/profile → 200 OK
Visible status: Saved
Reloaded profile: Mira Chen
1 passed (illustrative)
```

</details>

### Failed save preserves the draft

<img src="assets/retry-failure.svg" alt="The API returns 503. The entered name stays visible and Retry is available." width="448">

<details>
<summary>Commands and results</summary>

Mock PATCH /api/profile to return 503, then click Save.

```sh
npx playwright test tests/profile-retry.spec.ts --grep "retains draft"
```

```text
PATCH /api/profile → 503 Service Unavailable
Input value: Mira Chen
Visible action: Retry
1 passed (illustrative)
```

</details>

### Retry saves the retained draft

<img src="assets/retry-recover.svg" alt="Retry sends the retained draft and a 200 confirms it is saved." width="448">

<details>
<summary>Commands and results</summary>

Fail the first PATCH with 503, then allow the next PATCH. Click Retry without retyping; reload to confirm the saved profile.

```sh
npx playwright test tests/profile-retry.spec.ts --grep "retry succeeds"
```

```text
First PATCH → 503 Service Unavailable
Retry body: {"name":"Mira Chen"}
Second PATCH → 200 OK
Reloaded profile: Mira Chen
1 passed (illustrative)
```

</details>

**Limit:** Does not cover navigation away, refresh recovery, or duplicate submissions after an ambiguous network timeout.
