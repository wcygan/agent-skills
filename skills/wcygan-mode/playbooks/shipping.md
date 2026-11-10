# Shipping

Land verified changes in dependency order.

1. Establish the changes the user approved to land and who owns publication.
   Follow `wcygan-deliver` and retain evidence for the exact revisions.
2. Obtain independent verification when available; report when it is not. Passing
   checks alone leave the intended user behavior unproven, because checks cover
   what they test, not the user journey.
3. For dependent changes, identify the contiguous verified sequence from the base.
   Stop at the first unverified dependency and report it; a later passing change
   still depends on it.
4. Recheck content and integration context before each landing. Changed bases or
   patches require affected evidence to be renewed.
5. Land one change at a time, then read back the actual result and next dependency.
   Keep a single owner for branch and base mutations.

Complete with confirmed landed changes, verification evidence, and the next gap.
Report a queued merge as queued until read-back confirms it landed. Land only the
approved sequence; a further change needs its own go-ahead.
