# ASCII & Braille Art Generator

An in-browser React/Vite workspace for turning image pixels into ASCII or Unicode Braille art. Processing is designed to stay on the device; image data is not uploaded by the application.

> **Status (2026-10-01):** pre-release, Phase 1 in progress. The current build fails TypeScript checks, and image conversion is blocked by a missing pixel buffer in the worker request. See [Milestones and progress](docs/milestones.md) for the current checklist.

## Current capabilities

- File picker, drag-and-drop, URL input, and native image decoding are present in source.
- ASCII/Braille core routines, a pipeline worker, and controls for width, tone, stretch, dithering, ramps, and threshold are present; the worker handoff must be repaired before the image flow can be called working.
- Responsive controls/output layouts, light and dark themes, and a landing-page Docs section are implemented in UI code. Browser verification remains open.
- FIGlet text controls and font assets exist. Raster text, exports, HEIC fallback, and advanced rendering options remain incomplete.

The [feature breakdown](docs/features.md#feature-status) distinguishes implemented code from verified behavior. Some visible controls and all export buttons are currently placeholders.

## Quick start

Requirements: Node.js 20 or newer and npm.

```bash
git clone <your-repo-url> ascii-braille-generator
cd ascii-braille-generator
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

### Available scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Vite development server. |
| `npm run typecheck` | Run strict TypeScript checks without emitting files. |
| `npm run build` | Type-check and create the production bundle in `dist/`. |
| `npm run preview` | Serve the production bundle locally. |
| `npm run lint` | Run ESLint when the local ESLint configuration is available. |

Vitest, Playwright, and Prettier are planned but are not currently installed or exposed as npm scripts.

## Repository layout

```text
.
├─ public/              # Logo and landing-page assets
├─ src/
│  ├─ app/              # App shell, theme, navigation, entry point
│  ├─ core/             # Pure ASCII, Braille, color, dithering, and resize logic
│  ├─ io/               # Browser image loading helpers
│  ├─ state/            # Settings and application state
│  ├─ ui/               # React components and CSS Modules
│  └─ workers/          # Off-main-thread image processing
├─ docs/                # Architecture, feature, UI, processing, and deployment notes
├─ index.html
├─ package.json
└─ vite.config.ts
```

## Documentation

- [Features](docs/features.md) — capability-by-capability status and intended behavior.
- [Milestones and progress](docs/milestones.md) — current phase, open work, and completion criteria.
- [UI specification](docs/ui-spec.md) — layout, responsive states, and accessibility intent.
- [Architecture](docs/architecture.md) — module boundaries and runtime flow.
- [Processing](docs/processing.md) — image-to-character conversion details.
- [Text mode](docs/text-mode.md) — current FIGlet/raster work and target behavior.
- [HEIC support](docs/heic-support.md) — current native-only handling and future fallback design.
- [Deployment](docs/deployment.md) — Vercel guidance and cache/security headers.
- [Testing](docs/testing.md) — available checks and planned test coverage.
- [Contributing](CONTRIBUTING.md) — workflow and coding guidance.

## Privacy and security

Keep processing client-side. Do not upload or log user images/text, add third-party runtime requests, or commit personal fixtures. Validate new browser-facing features against the CSP and update the relevant documentation.

## Roadmap

| Phase | Status | Scope |
|---|---|---|
| 1 | In progress | Stabilize image conversion, controls, responsive UI, and deployment. |
| 2 | Groundwork present | Complete text-to-ASCII/Braille processing, HEIC fallback decoding, PNG/text exports, and sharing formats. |
| 3 | Planned | Implement color/gradient output, advanced dithering, edges/calibration, SVG/HTML export, and shareable settings. |
| Later | Unscheduled | Optional URL-image proxy, glyph matching, literary Braille transliteration, and animated GIF support. |

The [milestone tracker](docs/milestones.md) has the dated exit criteria. A phase is not complete because its UI is visible.

## License

No repository license has been selected yet. Add a `LICENSE` file and record third-party asset licenses before public distribution.
