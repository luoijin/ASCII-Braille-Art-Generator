# Testing

How the project is tested and what “done” means for a change.

## Contents

- [Strategy](#strategy)
- [Unit tests](#unit-tests)
- [End-to-end tests](#end-to-end-tests)
- [Fixtures](#fixtures)
- [Visual and accessibility checks](#visual-and-accessibility-checks)
- [Performance checks](#performance-checks)
- [Running tests](#running-tests)
- [Definition of done](#definition-of-done)

## Strategy

| Layer | Tool | Covers |
|---|---|---|
| Unit | Vitest | Everything in `src/core/` and `src/io/sniff.ts` |
| End to end | Playwright (Chromium, Firefox, WebKit) | Upload, conversion, export, HEIC paths |
| Accessibility | axe via Playwright, plus manual review | Labels, focus, contrast, announcements |
| Performance | Scripted benchmarks and bundle-size checks | Latency and payload budgets |

Because `src/core/` is pure and deterministic, most logic can be tested with small in-memory pixel buffers and exact expected strings. The repository does not yet include a test runner or `tests/` directory, so the tables below define the target coverage for the planned harness.

## Unit tests

| Area | What to check |
|---|---|
| Braille packing | All dots on gives U+28FF; all off gives U+2800, or U+2804 with fill-blank; each single dot sets the expected bit; partial blocks at the right and bottom edges pad correctly |
| Color | sRGB to linear and back round-trips; luminance of red, green, blue, and a gray ramp |
| Resampling | A constant image stays constant; the mean is preserved when downscaling; output size is correct |
| Tone | Identity settings leave values unchanged; results stay within `[0, 1]` |
| Dithering | Golden snapshot for each kernel on a fixed 16×16 gradient; average output coverage is close to average input; serpentine on and off are each deterministic; strength 0 equals no dithering |
| Ordered / blue noise | Threshold tile values are within range; output is stable across runs |
| Otsu | Bimodal histogram yields a threshold between the modes |
| ASCII | Calibrated ramp is sorted and free of near-duplicates; nearest-target quantization; edge angle binning |
| FIGlet wrapper | Missing font gives a clear error; a loaded font is not fetched twice |
| Text raster | Output size matches measured text; alignment shifts lines as expected (use a stubbed canvas) |
| Export | Full-width mapping covers `!` to `~` and space; Discord fence and length warning; `.txt` uses LF endings |
| HEIC sniffing | `heic`, `heix`, `mif1` detected; non-HEIC and short buffers rejected; extension and MIME shortcuts |

Example golden test:

```ts
import { describe, it, expect } from 'vitest';
import { packBraille } from '../src/core/braille/bitmap';

describe('packBraille', () => {
  it('maps a full 2x4 block to U+28FF', () => {
    const dots = new Uint8Array(8).fill(1);
    expect(packBraille(dots, 2, 4)).toBe('\u28FF');
  });

  it('maps an empty block to U+2800, or U+2804 with fillBlank', () => {
    const dots = new Uint8Array(8);
    expect(packBraille(dots, 2, 4)).toBe('\u2800');
    expect(packBraille(dots, 2, 4, true)).toBe('\u2804');
  });

  it('maps dot 7 (bottom-left) to bit 0x40', () => {
    const dots = new Uint8Array(8);
    dots[3 * 2 + 0] = 1; // row 3, col 0
    expect(packBraille(dots, 2, 4)).toBe('\u2840');
  });
});
```

## End-to-end tests

| Scenario | Expected |
|---|---|
| Upload PNG, JPEG, WebP | Preview renders in ASCII and in Braille |
| Upload sample HEIC in Chromium and Firefox | Fallback decoder runs; preview renders |
| Upload sample HEIC in WebKit | Native or fallback path succeeds |
| Corrupt file | Friendly error; app still works afterward |
| File over the size limit | Friendly error |
| Drag a slider | UI stays responsive; stale results are discarded |
| Switch ASCII and Braille | Shared settings persist |
| Text tab, FIGlet | Font loads on first selection; output shows |
| Text tab, Raster, ASCII and Braille | Output shows; Braille selects Raster automatically |
| Copy art, Download `.txt` | Clipboard text and file bytes match the preview |
| Discord and full-width export | Formatting matches spec; count warning appears past the limit |
| PNG export at 1×, 2×, 4× | Image dimensions scale as expected |
| Theme toggle and reduced motion | Both respected |

Run the suite against a Vercel preview deployment as well as locally, since the CSP and headers only apply there.

## Fixtures

When the test harness is added, store fixtures in `tests/fixtures/`.

| Fixture | Purpose |
|---|---|
| `gradient-16.png` | Dithering golden tests |
| `checker-8.png` | Resampling tests |
| `portrait.jpg` | Visual regression and end-to-end runs |
| `sample.heic` | HEIC path tests |
| `sample-multi.heic` | Multi-image file handling |
| `corrupt.heic` | Error path |
| `transparent.png` | Alpha compositing |
| `sample.svg`, `sample.gif`, `sample.avif` | Format coverage |

Rules for fixtures:

- Create them yourself or use images with a clear license, and record the source in `tests/fixtures/README.md`.
- Do not commit personal photos.
- Strip location and other metadata from any photo.
- Keep files small. Downscale where the test does not need full size.

## Visual and accessibility checks

- **PNG export snapshots.** Render fixed input with bundled fonts and compare against reference images with a small tolerance.
- **Axe audit.** Run against the empty state, an image loaded, and the text tab.
- **Manual pass.** Keyboard-only walkthrough, and a screen reader check of the output region and live announcements.
- **Devices.** iOS Safari and Android Chrome, especially HEIC memory behavior and clipboard permissions.

## Performance checks

Targets (validate on representative hardware; these are goals, not guarantees):

| Metric | Target |
|---|---|
| Initial JavaScript, gzip | 200 KB or less, excluding HEIC, FIGlet, and export chunks |
| Largest Contentful Paint | 2.5 s or less on a mid-range phone over 4G |
| Re-render after a control change, 300 columns | 100 ms or less |
| Decode plus first render, 12 MP JPEG | 1.5 s or less |
| Decode plus first render, 12 MP HEIC via WASM | 4 s or less, with visible progress |

The bundle budget is a target; there is currently no CI workflow or bundle-size gate.

## Running tests

```bash
npm run typecheck     # available now
npm run build         # available now
npm run lint          # available when ESLint is configured
# Planned after the test dependencies are added:
npm test              # unit tests, once
npm run test:watch    # unit tests, watch mode
npm run test:e2e      # Playwright, all browsers
npx playwright test --project=webkit   # one browser
```

First-time Playwright setup, once configured: `npx playwright install --with-deps`.

## Definition of done

A change is done when:

- Unit tests cover new logic in `src/core/`, with golden snapshots where output is text.
- Existing tests pass locally and in CI.
- The change works in Chromium, Firefox, and WebKit if it touches browser APIs.
- New UI has labels, keyboard access, and focus styling.
- No new console errors or CSP violations on a preview deployment.
- Docs are updated if behavior or settings changed.
