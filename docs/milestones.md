# Milestones and progress

This is the repository's progress tracker. [Features](features.md) describes each capability; this page records the work required to complete the existing three phases in the [README roadmap](../README.md#roadmap).

**Baseline: 2026-10-01. Current phase: Phase 1 — in progress.** Phases 2 and 3 have some UI and code groundwork, but neither is complete. The app remains pre-release.

## How to read this tracker

- `[x]` means the observable result passed and evidence was recorded. No functional subfeature is checked at this baseline.
- `[ ]` means work or verification remains. Each ID corresponds to a row in the [feature status tables](features.md#feature-status); complete it only after its stated check passes, then add a test or pull request link when available.
- A phase is complete only when every exit criterion in that phase is met. Update the baseline date and evidence whenever a status changes. Do not infer a percentage from the number of controls visible in the UI.

**Present in code, not verified:** the React/Vite shell, responsive panes, theme and navigation controls, image input widgets, ASCII/Braille algorithms, FIGlet fonts and text controls, raster text attempt, export buttons, and advanced-option widgets. This inventory is intentionally outside the completion checklists.

## Collaboration assignments

These are proposed ownership areas for Jan and Anne, not completion claims. Each owner implements and verifies their items; the other person reviews the pull request. Keep the feature IDs below as the source of truth for acceptance checks.

Recommended branch names and the fork pull-request workflow are documented in [Contributing](../CONTRIBUTING.md#recommended-task-branches).

| Phase | Jan owns | Anne owns |
|---|---|---|
| 1 | Image worker, render scheduling, ASCII/Braille conversion, and rendering controls (`RE-01`–`RE-27`); fix blocking core/text TypeScript errors and add deterministic core image tests; image browse flow (`IN-01`) | Image loading, limits, and input errors (`IN-02`–`IN-08`); desktop/mobile behavior and accessibility (`UI-01`–`UI-13`); fix UI TypeScript errors and configure lint, browser tests, and CI |
| 2 | FIGlet and raster text (`TX-01`–`TX-15`), including the pixel-buffer type mismatch | Clipboard/download/share actions (`EX-01`–`EX-10`) and native/fallback HEIC (`IN-09`–`IN-10`) |
| 3 | Advanced dithering, edges, and ramp calibration (`AD-01`–`AD-07`) | Source/gradient color and advanced export/share (`AD-08`–`AD-14`) |

**Start in parallel:** Jan fixes the missing worker pixel payload and core/text build errors, then verifies one PNG in ASCII and Braille (`RE-01`, `RE-03`, `RE-04`). Anne implements pre-decode limits, object-URL cleanup, and visible input errors (`IN-05`–`IN-08`), fixes UI build errors, and sets up the browser-test harness. Anne can then exercise the complete image flow after Jan's worker fix lands. The typecheck/build gates need both tracks.

**Shared-file handoff:** both tracks may need `src/app/App.tsx` and `src/ui/ControlsPanel.tsx`. Coordinate those edits in separate, small pull requests; Jan owns render/text integration first, then Anne wires input/export integration against the resulting output contract. Both review the Phase 1 browser results before marking a checkbox complete. No work is assigned as finished merely because it has an owner.

## Phase 1 — Stable image generator (in progress)

**Goal:** A user can load a supported image and reliably produce ASCII or Braille art on desktop and mobile.

### Image input and decoding

- [ ] IN-01: Browsing for a PNG produces decoded pixels without an input error. — Jan
- [ ] IN-02: Dropping a PNG follows the same successful path as browsing. — Anne
- [ ] IN-03: A CORS-enabled URL loads, while a blocked host produces a useful message. — Anne
- [ ] IN-04: PNG, JPEG, GIF, and WebP fixtures reach conversion in target browsers. — Anne
- [ ] IN-05: A file over 25 MB is rejected before decode with the limit shown. — Anne
- [ ] IN-06: Excessive image dimensions are bounded without excessive decode memory. — Anne
- [ ] IN-07: Temporary object URLs are released after successful and failed loads. — Anne
- [ ] IN-08: Corrupt, unsupported, and CORS-blocked inputs show actionable UI errors. — Anne

### Image rendering and controls

- [ ] RE-01: A worker receives transferred pixels and returns a result; the `imageData` payload is currently missing. — Jan
- [ ] RE-02: Rapid setting changes display only the latest result without redundant jobs. — Jan
- [ ] RE-03: A known PNG produces readable ASCII with correct dimensions. — Jan
- [ ] RE-04: The same PNG produces Braille cells with correct dimensions. — Jan
- [ ] RE-05: Width changes output columns and the derived row count. — Jan
- [ ] RE-06: Brightness changes a fixed fixture's tone in the expected direction. — Jan
- [ ] RE-07: Contrast changes a fixed fixture's tonal separation. — Jan
- [ ] RE-08: Gamma changes midtones without shifting black/white endpoints. — Jan
- [ ] RE-09: Stretch X changes output's horizontal proportion. — Jan
- [ ] RE-10: Stretch Y changes output's vertical proportion. — Jan
- [ ] RE-11: Inversion reverses the light/dark character mapping. — Jan
- [ ] RE-12: None mode removes error diffusion on a fixed fixture. — Jan
- [ ] RE-13: Floyd–Steinberg output matches a deterministic gradient reference. — Jan
- [ ] RE-14: Atkinson output differs from Floyd–Steinberg as expected. — Jan
- [ ] RE-15: Dither strength changes error propagation predictably. — Jan
- [ ] RE-16: Serpentine scan changes the expected fixture deterministically. — Jan
- [ ] RE-17: Classic output uses the Classic ramp. — Jan
- [ ] RE-18: Extended output uses the Extended ramp. — Jan
- [ ] RE-19: Blocks output uses the Blocks ramp. — Jan
- [ ] RE-20: Custom output uses only the supplied valid ramp characters. — Jan
- [ ] RE-21: Automatic Braille threshold finds a useful split on a two-tone fixture with dithering off. — Jan
- [ ] RE-22: Manual threshold changes Braille dot coverage with dithering off. — Jan
- [ ] RE-23: Fill blank changes empty Braille cells from U+2800 to U+2804. — Jan
- [ ] RE-24: The reset button's label matches its actual values, and resetting rerenders. — Jan
- [ ] RE-25: Reset stretch restores X and Y to 1 and rerenders. — Jan
- [ ] RE-26: ASCII/None auto and manual thresholds alter output, or those controls are hidden in ASCII mode. — Jan
- [ ] RE-27: None color mode produces uncolored ASCII and Braille previews. — Jan

### Interface and accessibility

- [ ] UI-01: Desktop controls and output fit and remain usable at desktop widths. — Anne
- [ ] UI-02: Mobile controls/output switching has no overlap or trapped content. — Anne
- [ ] UI-03: Only the navbar sticks, and content behind it blurs. — Anne
- [ ] UI-04: Features and Docs links smoothly reach the right sections by pointer and keyboard. — Anne
- [ ] UI-05: Light and dark palettes transition without errors. — Anne
- [ ] UI-06: Preview zoom changes size without changing exported art. — Anne
- [ ] UI-07: Empty image and text views offer the right next action. — Anne
- [ ] UI-08: Reset all behaves as labeled and updates output consistently. — Anne
- [ ] UI-09: Every control is keyboard-reachable, labeled, and operable. — Anne
- [ ] UI-10: Processing, copy success, and errors are announced without stale messages. — Anne
- [ ] UI-11: Scroll, theme, and other motion honor reduced-motion preference. — Anne
- [ ] UI-12: Switching Image/Text shows the right controls and preserves intended state. — Anne
- [ ] UI-13: Switching ASCII/Braille produces selected art with valid controls. — Anne

### Phase 1 quality gates

- [ ] `npm.cmd run typecheck` passes; it currently fails on TypeScript errors.
- [ ] `npm.cmd run build` passes and its production preview is usable; the build currently fails at TypeScript.
- [ ] `npm.cmd run lint` passes after ESLint is installed/configured; it currently fails.
- [ ] Deterministic core image tests and a cross-browser smoke test run in CI.
- [ ] The production image path is checked in Chromium, Firefox, and WebKit following [testing.md](testing.md).

**Exit criterion:** every Phase 1 checkbox has evidence; the production build and image-to-ASCII/Braille browser flows pass. Advanced controls scheduled for Phase 3 must either work when exposed or be clearly identified as unavailable until that phase.

## Phase 2 — Text, export, and HEIC (groundwork present)

**Goal:** Text input, exports, and iPhone-photo decoding work end to end without uploading user content.

### Text generation

- [ ] TX-01: Multiline input reaches the selected engine in order. — Jan
- [ ] TX-02: Switching FIGlet/Raster visibly changes rendered output. — Jan
- [ ] TX-03: The local FIGlet font list loads and a failed load is handled visibly. — Jan
- [ ] TX-04: A selected FIGlet font renders expected ASCII text in target browsers. — Jan
- [ ] TX-05: Each FIGlet layout option changes a suitable fixture as documented. — Jan
- [ ] TX-06: FIGlet text wraps at the selected width without dropping words. — Jan
- [ ] TX-07: Left, center, and right alignment visibly reposition FIGlet lines. — Jan
- [ ] TX-08: Raster text produces ASCII through a correctly typed pixel buffer; the current buffer type/import fails typecheck. — Jan
- [ ] TX-09: Raster text produces Braille while retaining multiline layout. — Jan
- [ ] TX-10: Choosing Braille uses Raster with consistent engine controls. — Jan
- [ ] TX-11: Each listed, licensed local font renders consistently. — Jan
- [ ] TX-12: Raster weight visibly changes a fixed text fixture. — Jan
- [ ] TX-13: Raster line height changes multiline spacing. — Jan
- [ ] TX-14: Raster left/center/right alignment matches expected positions. — Jan
- [ ] TX-15: Raster wrap width breaks long text predictably before rendering. — Jan

### Export and sharing

The buttons exist, but their callbacks are currently empty. Verify the resulting clipboard or file, not just the click.

- [ ] EX-01: Copy art puts the current plain-text output on the clipboard. — Anne
- [ ] EX-02: Downloaded `.txt` contains current art in UTF-8 with LF endings. — Anne
- [ ] EX-03: Discord action copies a valid monospace code block with current art. — Anne
- [ ] EX-04: Twitch/YouTube action copies the intended full-width mapping. — Anne
- [ ] EX-05: Discord warning counts the full formatted message, not only line one. — Anne
- [ ] EX-06: Copy image puts a pasteable PNG on the clipboard. — Anne
- [ ] EX-07: Download PNG 1× matches base render dimensions. — Anne
- [ ] EX-08: Download PNG 2× doubles both base dimensions. — Anne
- [ ] EX-09: Download PNG 4× quadruples both base dimensions. — Anne
- [ ] EX-10: Actions require current rendered output and report clipboard/download failures. — Anne

### HEIC and Phase 2 quality gates

- [ ] IN-09: A HEIC fixture renders in a browser with native decoding. — Anne
- [ ] IN-10: The same fixture renders through a lazy, client-side fallback where native decoding is unavailable. — Anne
- [ ] Unit and cross-browser checks cover text, export, and HEIC results and error paths in [testing.md](testing.md).

**Exit criterion:** all Phase 2 actions produce the promised output in supported browsers, error paths are visible to users, and the automated checks pass.

## Phase 3 — Advanced output (planned)

**Goal:** Advanced rendering and sharing options produce distinct, verifiable results.

### Advanced rendering

- [ ] AD-01: Ordered mode produces a distinct tiled Bayer result. — Jan
- [ ] AD-02: 2×2, 4×4, and 8×8 matrices each produce their expected pattern. — Jan
- [ ] AD-03: Blue-noise mode produces distinct repeatable output from a fixed tile. — Jan
- [ ] AD-04: A validated custom kernel changes the output. — Jan
- [ ] AD-05: Edge detection adds directional glyphs on strong edges. — Jan
- [ ] AD-06: Raising edge threshold reduces marked edges on a fixture. — Jan
- [ ] AD-07: Measured glyph densities predictably change calibrated ramp targets. — Jan
- [ ] AD-08: Preview and image export display sampled source colors. — Anne
- [ ] AD-09: Preview and image export display a selected two-color gradient. — Anne
- [ ] AD-10: Horizontal and vertical gradient choices produce distinct results. — Anne
- [ ] AD-11: User-selected endpoint colors appear in the output. — Anne

### Advanced export and sharing

- [ ] AD-12: Downloaded SVG preserves art layout and supported colors. — Anne
- [ ] AD-13: Downloaded HTML preserves art layout and supported colors. — Anne
- [ ] AD-14: A copied link restores supported settings on reload. — Anne
- [ ] Regression checks distinguish each advanced option; plain-text output remains colorless.

**Exit criterion:** every advanced option produces its documented result and has regression coverage. The later ideas in the README (URL proxy, glyph matching, literary Braille, animated GIFs) are outside these three phases.

## Quality gates and current evidence

| Check | 2026-10-01 result | Needed for completion |
|---|---|---|
| `npm.cmd run typecheck` | Fails: current TypeScript errors | Pass |
| `npm.cmd run build` | Fails at the TypeScript step | Pass and produce a usable preview |
| `npm.cmd run lint` | Fails: ESLint is not installed/configured | Configure lint, then pass |
| Unit and browser tests | No Vitest/Playwright harness or test scripts | Add tests for each completed path and run them in CI |
| CI | No committed workflow | Run build and tests on pull requests |

The current TypeScript failures include an invalid state-types import and pixel-buffer type in `src/core/text/textToBitmap.ts`, type/unused-parameter errors in `src/core/processBitmap.ts`, and UI errors in `src/ui/Header.tsx` and `src/ui/HeroBackdrop.tsx`. This table records the baseline; rerun the commands before changing any check to passing.
