# Features

This guide separates the features currently represented in code from the intended behavior. For implementation details, see [processing.md](processing.md). For work remaining in each phase, see [milestones.md](milestones.md).

## Contents

- [Feature status](#feature-status)
- [Modes at a glance](#modes-at-a-glance)
- [ASCII or Braille](#ascii-or-braille)
- [Image controls](#image-controls)
- [Dithering](#dithering)
- [Character ramps](#character-ramps)
- [Edge detection](#edge-detection)
- [Color](#color)
- [Text mode](#text-mode)
- [Exporting](#exporting)
- [Limits](#limits)
- [Troubleshooting](#troubleshooting)

## Feature status

Status as of **2026-10-01** on `main`. Each ID maps to one item in the [milestone checklist](milestones.md). **Verified** means the stated check passed and evidence was recorded; none of the functional conversion paths meets that standard yet. **Partial** means code exists but behavior is incomplete or unverified. **Blocked** means a known defect prevents the result. **UI only** means a visible control has no corresponding effect or action. **Planned** means the implementation is absent. A checkbox in the milestone page is complete only when its own “Done when” check passes.

### Image input and decoding

| ID | Subfeature | Status now | Done when | Phase |
|---|---|---|---|---|
| IN-01 | Browse for an image | Partial: file picker calls the decoder | Selecting a PNG produces decoded pixels without an input error | 1 |
| IN-02 | Drag and drop an image | Partial: drop zone forwards the first file | Dropping a PNG follows the same successful path as browsing | 1 |
| IN-03 | Load an image URL | Partial: URL field uses browser image loading | A CORS-enabled URL loads; a blocked host shows a useful message | 1 |
| IN-04 | Decode PNG, JPEG, GIF, and WebP | Partial: browser-native `Image` decoding exists | Supported fixtures decode and reach conversion in target browsers | 1 |
| IN-05 | Reject files over 25 MB | Planned: no pre-decode file-size check | Oversized files stop before decoding and show the configured limit | 1 |
| IN-06 | Limit decoded image size | Partial: worker caps the longest side after decode | Oversized dimensions are bounded without excessive decode memory | 1 |
| IN-07 | Release temporary file URLs | Planned: created object URLs are not revoked | A file URL is released after both success and failure | 1 |
| IN-08 | Show file and URL errors | Planned: failures are logged to the console | Corrupt, unsupported, and CORS-blocked inputs show actionable UI errors | 1 |
| IN-09 | Native HEIC/HEIF decode | Partial: the browser decoder is attempted | A fixture renders where native decoding is available | 2 |
| IN-10 | HEIC/HEIF fallback | Planned: no format sniffing or fallback worker | A HEIC fixture renders where native decoding is unavailable | 2 |

### Image rendering and controls

| ID | Subfeature | Status now | Done when | Phase |
|---|---|---|---|---|
| RE-01 | Transfer pixels to the worker | Blocked: `imageData` is omitted from the message payload | Worker receives the transferred pixels and returns a result | 1 |
| RE-02 | Latest-result scheduling | Planned: no request IDs or debounce | Rapid control changes show only the newest result without repeated jobs | 1 |
| RE-03 | Image to ASCII | Blocked by RE-01 | A known PNG produces readable ASCII with correct dimensions | 1 |
| RE-04 | Image to Braille | Blocked by RE-01 | The same PNG produces Braille cells with correct dimensions | 1 |
| RE-05 | Output width | Partial: slider passes 20–300 columns | Changing width changes output columns and derived row count | 1 |
| RE-06 | Brightness | Partial: value reaches both processors | A fixed fixture becomes lighter/darker in the expected direction | 1 |
| RE-07 | Contrast | Partial: value reaches both processors | A fixed fixture's tonal separation changes as expected | 1 |
| RE-08 | Gamma | Partial: value reaches both processors | Midtones change while black/white endpoints remain stable | 1 |
| RE-09 | Stretch X | Partial: image worker receives the value | Horizontal stretch changes output proportions as specified | 1 |
| RE-10 | Stretch Y | Partial: image worker receives the value | Vertical stretch changes output proportions as specified | 1 |
| RE-11 | Invert brightness | Partial: value reaches both processors | Switching it reverses the output's light/dark mapping | 1 |
| RE-12 | No dithering | Partial: direct quantization path exists | Switching to None removes error diffusion on a fixed fixture | 1 |
| RE-13 | Floyd–Steinberg dithering | Partial: kernel path exists | Fixed gradient matches a deterministic reference result | 1 |
| RE-14 | Atkinson dithering | Partial: kernel path exists | Fixed gradient differs from Floyd–Steinberg as expected | 1 |
| RE-15 | Dither strength | Partial: value reaches diffusion code | Lowering strength changes error propagation predictably | 1 |
| RE-16 | Serpentine scan | Partial: toggle reaches diffusion code | Alternating scan changes the expected fixture deterministically | 1 |
| RE-17 | Classic ramp | Partial: preset is passed to the worker | ASCII output uses the Classic character set | 1 |
| RE-18 | Extended ramp | Partial: preset is passed to the worker | ASCII output uses the Extended character set | 1 |
| RE-19 | Blocks ramp | Partial: preset is passed to the worker | ASCII output uses the Blocks character set | 1 |
| RE-20 | Custom ramp | Partial: typed characters are passed to the worker | Output shades with only the supplied valid ramp characters | 1 |
| RE-21 | Automatic Braille threshold | Partial: Otsu calculation exists | With dithering off, a two-tone fixture selects a useful split | 1 |
| RE-22 | Manual Braille threshold | Partial: slider value reaches the worker | With dithering off, changing the threshold changes dot coverage | 1 |
| RE-23 | Fill blank Braille cells | Partial: Braille packing supports it | Empty cells change from U+2800 to U+2804 when enabled | 1 |
| RE-24 | Reset brightness & contrast | Partial: button also resets gamma without saying so | Its label matches the values it resets, and output updates | 1 |
| RE-25 | Reset stretch controls | Partial: button resets X and Y | Both values return to 1 and output proportions update | 1 |
| RE-26 | ASCII threshold controls | UI only: shown in ASCII/None mode but ignored by its renderer | Auto/manual threshold affects ASCII output or is not shown in ASCII mode | 1 |
| RE-27 | Monochrome color mode | Partial: None is the default; image output is blocked | None produces uncolored ASCII and Braille previews | 1 |

### Text generation

| ID | Subfeature | Status now | Done when | Phase |
|---|---|---|---|---|
| TX-01 | Enter multiline text | Partial: textarea stores text | Typed lines reach the chosen text engine in order | 2 |
| TX-02 | Choose FIGlet or Raster | Partial: engine switch exists | Switching engines changes the rendered output accordingly | 2 |
| TX-03 | Load the FIGlet font list | Partial: local manifest and fallback picker exist | Font list loads and errors are shown without breaking selection | 2 |
| TX-04 | Render FIGlet ASCII | Partial: asynchronous path and local fonts exist | A selected font produces expected ASCII text in target browsers | 2 |
| TX-05 | FIGlet layout | Partial: five options are passed to `figlet` | Each layout changes a suitable fixture as documented | 2 |
| TX-06 | FIGlet wrap width | Partial: input is wrapped before rendering | Long input wraps at the selected width without losing words | 2 |
| TX-07 | FIGlet alignment | UI only: setting is ignored by direct FIGlet output | Left, center, and right visibly align FIGlet lines | 2 |
| TX-08 | Raster text to ASCII | Blocked: bitmap data type and import fail typecheck | Typed text produces ASCII through a correctly typed pixel buffer | 2 |
| TX-09 | Raster text to Braille | Blocked by the raster buffer path | Typed text produces Braille with preserved line layout | 2 |
| TX-10 | Braille selects Raster | Partial: state switches engines | Choosing Braille always uses Raster and leaves controls consistent | 2 |
| TX-11 | Raster font family | Partial: picker changes the canvas font; fonts are not bundled | Each listed, licensed local font renders consistently | 2 |
| TX-12 | Raster weight | Partial: value reaches the canvas font | Weight visibly changes a fixed text fixture | 2 |
| TX-13 | Raster line height | Partial: value reaches canvas layout | Multiline spacing changes at the selected value | 2 |
| TX-14 | Raster alignment | Partial: canvas positions each line | Left, center, and right positions match expected pixels | 2 |
| TX-15 | Raster wrap width | Partial: input wrapping helper exists | Long text wraps predictably before rasterization | 2 |

### Export and sharing

All export buttons are visible, but `ControlsPanel` currently passes empty callbacks. The checks below include the actual copied or downloaded result, not just the button click.

| ID | Subfeature | Status now | Done when | Phase |
|---|---|---|---|---|
| EX-01 | Copy plain art | UI only | Clipboard text equals the current output | 2 |
| EX-02 | Download `.txt` | UI only | UTF-8 file contains current art with LF line endings | 2 |
| EX-03 | Discord formatting | UI only | Clipboard has a valid monospace code block containing the art | 2 |
| EX-04 | Twitch/YouTube full-width text | UI only | Clipboard contains the intended full-width mapping | 2 |
| EX-05 | Discord character count | Partial: only the first output line is counted | Warning reflects the full formatted message length | 2 |
| EX-06 | Copy image | UI only | Clipboard contains a pasteable PNG of the art | 2 |
| EX-07 | Download PNG at 1× | UI only | Downloaded PNG dimensions match the base render | 2 |
| EX-08 | Download PNG at 2× | UI only | Downloaded PNG dimensions double each base dimension | 2 |
| EX-09 | Download PNG at 4× | UI only | Downloaded PNG dimensions quadruple each base dimension | 2 |
| EX-10 | Export availability and failures | Partial: buttons use input presence, not rendered output | Actions enable only for current output and show clipboard/download errors | 2 |

### Interface and accessibility

| ID | Subfeature | Status now | Done when | Phase |
|---|---|---|---|---|
| UI-01 | Desktop controls/output layout | Partial: two-pane CSS exists | Both panes fit and remain usable at desktop widths | 1 |
| UI-02 | Mobile controls/output views | Partial: separate mobile views exist | Switching views never overlaps or traps content on a phone | 1 |
| UI-03 | Sticky glass navigation | Partial: styling exists | Only the navbar stays visible and content behind it blurs | 1 |
| UI-04 | Features/Docs navigation | Partial: animated scroll handler exists | Links reach the correct sections smoothly with keyboard and pointer | 1 |
| UI-05 | Light/dark theme | Partial: theme state and transitions exist | Both palettes render and transition without errors | 1 |
| UI-06 | Output zoom | Partial: 50–400% buttons exist | Zoom changes preview size without changing exported art | 1 |
| UI-07 | Empty output state | Partial: placeholder and image chooser exist | Empty image and text states give correct next actions | 1 |
| UI-08 | Reset all | Partial: settings reset; loaded image state remains | Reset behavior matches its label and updates the output consistently | 1 |
| UI-09 | Keyboard labels and focus | Partial: native controls and focus styles exist | Every control is reachable, labeled, and operable by keyboard | 1 |
| UI-10 | Live status and errors | Partial: processing live region exists | Processing, copy success, and errors are announced without stale messages | 1 |
| UI-11 | Reduced motion | Partial: several styles/effects respect the media query | All motion, including scroll and theme changes, respects the preference | 1 |
| UI-12 | Image/Text input switch | Partial: state and controls change modes | Switching modes shows the right controls and preserves intended state | 1 |
| UI-13 | ASCII/Braille output switch | Partial: state and controls change modes | Switching output modes produces the selected art and valid controls | 1 |

### Advanced output

| ID | Subfeature | Status now | Done when | Phase |
|---|---|---|---|---|
| AD-01 | Ordered dithering | UI only: uses diffusion fallback | Ordered mode uses a tiled Bayer threshold and distinct output | 3 |
| AD-02 | Bayer matrix size | UI only: 2×2, 4×4, 8×8 selector is ignored | Each matrix size produces its expected deterministic pattern | 3 |
| AD-03 | Blue-noise dithering | UI only: uses diffusion fallback | Fixed blue-noise tile produces distinct repeatable output | 3 |
| AD-04 | Custom dithering kernel | UI only: no kernel editor or processing path | Selected custom kernel changes output and is validated | 3 |
| AD-05 | Edge detection | UI only: worker ignores the toggle | Enabled mode adds directional glyphs on strong edges | 3 |
| AD-06 | Edge threshold | UI only: worker ignores the slider | Raising threshold reduces the number of marked edges | 3 |
| AD-07 | Calibrate ramp to font | UI only: toggle is unused | Measured glyph densities change ramp targets predictably | 3 |
| AD-08 | Source color | UI only: output carries no per-cell colors | Preview and image export use sampled source colors | 3 |
| AD-09 | Text color gradient | UI only: toggle does not color output | Preview and image export show the selected two-color gradient | 3 |
| AD-10 | Gradient direction | UI only: direction is stored but unused | Horizontal and vertical choices produce distinct gradients | 3 |
| AD-11 | Gradient color selection | Planned: state has defaults but no color inputs | User can choose both colors and see them in output | 3 |
| AD-12 | SVG export | Planned | Downloaded SVG preserves layout and supported colors | 3 |
| AD-13 | HTML export | Planned | Downloaded HTML preserves layout and supported colors | 3 |
| AD-14 | Shareable settings | Planned | A copied link restores supported settings on reload | 3 |

The [milestone checklist](milestones.md) groups these IDs into the existing phases. Source presence or a visible control does not satisfy a “Done when” check by itself.

## Modes at a glance

The app has two switches:

| Switch | Options |
|---|---|
| **Input** | Image, Text |
| **Output** | ASCII, Braille |

The goal is all four combinations. On this baseline, image conversion is blocked by the worker message; FIGlet has an unverified ASCII path; raster text conversion is incomplete. Switching modes in the UI does not establish that a conversion succeeds.

## ASCII or Braille

| | ASCII | Braille |
|---|---|---|
| Samples per character | 1 | 8 (a 2×4 dot grid) |
| How tone is made | Glyphs of different ink density, plus dithering | Dot density (dots are on or off), plus dithering |
| Detail at 120 columns | Moderate | High |
| Look | Classic, textured | Smooth, fine grain |
| Alignment | Needs a monospace font | Braille glyphs are usually uniform width, but the blank pattern is fragile |
| Best for | Terminals, READMEs, retro style | Photos at small sizes, chat apps, social posts |

Because a Braille dot is only on or off, **dithering is what makes Braille photos look good.** Without it, the output is a hard silhouette.

## Image controls

| Control | Range | Effect |
|---|---|---|
| Width | 20–300 characters | Output width. Height follows the image and the character aspect ratio |
| Output zoom | 50–400% | Changes preview size only; does not change the text output |
| Brightness | −100 to +100 | Shifts all tones lighter or darker |
| Contrast | 0.25× to 3× | Expands or compresses the tonal range |
| Gamma | 0.5 to 2.5 | Adjusts midtones without moving black and white |
| Stretch X / Y | 0.5× to 2× | Corrects aspect ratio for fonts with unusual proportions |
| Invert | on / off | Swaps light and dark. Use it when art meant for a light background is shown on a dark one, or the reverse |
| Threshold | Auto or 0–255 | Cut-off between "on" and "off". Auto uses Otsu's method. Used when dithering is off |

Start with width, then contrast, then dithering. Change one thing at a time.

These controls are connected to settings, but the image path must be repaired before their visual effects can be verified. The threshold control affects the Braille path when dithering is off; the current ASCII path does not use the displayed threshold setting.

## Dithering

Dithering spreads the rounding error from each pixel to its neighbors. The result is that patches of dots or glyphs average out to the right brightness when seen from a distance.

| Method | Look | Use for |
|---|---|---|
| None | Hard edges, no gradients | Logos, line art |
| Floyd–Steinberg | Smooth, fine grain | Photos, portraits |
| Atkinson | Higher contrast, cleaner whites and blacks, some loss in the deepest shadows | Small outputs, graphics |
| Ordered (Bayer 2/4/8) | Regular, stable pattern | Predictable texture |
| Blue noise | Organic grain without visible structure | Natural gradients |
| Custom kernel | Whatever you define | Experiments |

Only **None**, **Floyd–Steinberg**, and **Atkinson** have distinct paths in the current renderer. Ordered, blue-noise, and custom are visible choices but currently use the Floyd–Steinberg fallback. The Bayer matrix selector therefore has no effect yet.

**Strength** (0–1) reduces how much error is passed on. Lower values give a cleaner but less tonally accurate result.
**Serpentine** scanning alternates row direction, which reduces diagonal streaks.

## Character ramps

A ramp is the list of characters used for shading, from lightest to darkest. The default is ten characters, from a space up to a dense symbol.

- **Presets:** classic, extended, blocks.
- **Custom:** type your own string, lightest first.
- **Calibrate to font (planned):** will measure how much ink each character uses and adjust the ramp targets. The current toggle does not change rendering.

## Edge detection

**Planned for ASCII mode.** A Sobel filter would find strong edges and replace shading characters with directional glyphs. The toggle and threshold are displayed, but the worker does not apply them.

## Color

| Option | What you get |
|---|---|
| None | Current monochrome text preview |
| Source (planned) | Each character takes the average color of the source area |
| Gradient (planned) | Two colors blended horizontally or vertically |

The Source and Gradient choices are visible but no color is carried through the current renderer. The future colored preview and PNG export must be implemented together. Plain-text exports cannot preserve color.

## Text mode

Choose **Text**, type your words, then choose ASCII or Braille output.

| Engine | Output | Notes |
|---|---|---|
| **FIGlet** | ASCII | Font files, picker, and direct text-rendering path exist; build and browser verification remain |
| **Raster** | ASCII or Braille | Canvas rasterization exists, but the current pixel-buffer mismatch blocks a verified conversion; outline/shadow effects are planned |

The FIGlet picker exposes default, full, fitted, and two smushing layouts. Wrap width is applied to input text; alignment is present in settings but is not applied to direct FIGlet output. See [text-mode.md](text-mode.md) for current and target behavior.

## Exporting

| Action | Result | Notes |
|---|---|---|
| Copy art | Plain text on the clipboard | |
| Download `.txt` | UTF-8 file, LF line endings | |
| Discord | Text wrapped in a code block | Discord limits message length (currently 2,000 characters for accounts without Nitro; check current limits). The app shows a character count |
| Twitch · YouTube | Full-width Unicode | Keeps columns aligned in chats that use proportional fonts |
| Copy image | PNG on the clipboard | Paste into Twitter, Instagram, and similar |
| Download PNG | PNG at 1×, 2×, or 4× | Keeps color and background |

**Current status:** all these buttons are present, but their callbacks in `ControlsPanel` are empty. The table describes their intended results, not working actions. The visible Discord count currently uses the first output line, rather than the total content that would be sent.

## Limits

| Limit | Current behavior |
|---|---|
| File size, intended 25 MB | Not enforced before decode |
| Longest side, intended 4096 px | Worker reduces dimensions during processing, after browser decoding |
| HEIC pixel count, intended 64 megapixels | Not enforced; fallback decoder is absent |
| Output width, 20–300 characters | Constrained by the width slider |

## Troubleshooting

**The Braille output is ragged or misaligned.**
Use a monospace font that includes Braille (for example DejaVu Sans Mono or Noto Sans Symbols 2). **Fill blank cells** is intended to prevent empty cells from collapsing in chat apps. PNG export is planned but not yet functional.

**The image looks inverted.**
Toggle **Invert**. Light text on a dark background needs bright pixels to map to dense characters; dark text on a light background needs the opposite.

**The image looks too flat or too noisy.**
Flat: raise contrast. Noisy: lower dither strength, switch to Atkinson, or increase width so each character covers less.

**A HEIC file does not open.**
The app currently relies on native browser decoding. The lazy HEIC fallback described in [heic-support.md](heic-support.md) has not been implemented.

**Loading from a URL fails.**
The image host must allow cross-origin access. Download the image and upload it instead.

**Copy or Download does nothing.**
The export buttons are currently placeholders. See [the Phase 2 checklist](milestones.md) for the work needed to enable them.
