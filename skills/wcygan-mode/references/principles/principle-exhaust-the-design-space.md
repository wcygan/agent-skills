# Exhaust the Design Space

Apply when facing a novel UI interaction or architectural decision with no precedent in the codebase. Build 2-3 competing prototypes and compare side by side before committing.

For a novel UI interaction, an architectural decision with no precedent in the codebase, or a product choice that depends on feel, build two or three throwaway prototypes and compare them side by side before committing. Skip this when the codebase already has a pattern, the choice is reversible in minutes, or a test can settle it.

- Keep each prototype cheap: a static page, a scratch file, or a short spike that is deleted afterward. If one needs production wiring to be judged, split the question.
- Compare in one place on what the user experiences, what each option makes impossible or easy, the cost to build and to change later, and what each forecloses.
- The user picks when the question is product feel. Otherwise pick, state the reason, and name what was given up. Never present one option as the only one considered.

Do not start the production implementation of a novel design before the comparison exists.

Adapted from Lauren Tan's [Pstack principle](https://github.com/cursor/plugins/tree/afd51cf66a3100a95f878d6c4b93a01f6508e3b0/pstack/skills/principle-exhaust-the-design-space). [MIT license](../LICENSE.txt).
