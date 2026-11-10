# Visual parity

Verify visual and interaction equivalence between implementations.

1. Fix the reference revision, viewport, data, state, fonts, and rendering environment.
   Capture the reference before changing the implementation.
2. List representative journeys, responsive states, and consequential interactions.
   Identify intentional differences rather than silently excluding mismatches.
3. Make bounded changes using `wcygan-implement`, then
   compare captured outputs under the same conditions. Inspect meaningful differences.
4. Follow `wcygan-verify`, including keyboard/focus behavior
   and side effects where relevant. Preserve reference and resulting evidence.

Complete with the comparison method, observed differences, and coverage. Report
an approximate comparison or a missing capture environment as inconclusive,
because exact parity needs identical conditions.
