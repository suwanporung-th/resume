# Resume

## Purpose

- Static multi-version resume website for Peerapat Suwanphorung, one page per target job role, built from a single data file.

## Ownership

- `data/resume.json` — single source of truth: profile, experience, portfolio, and the `variants` list.
- `src/style.css` — screen and A4 print styles.
- `src/qr.mjs` — dependency-free QR encoder (byte mode, ECC M, versions 1–10) used by `build.mjs` at build time.
- `build.mjs` — dependency-free Node generator; writes `dist/index.html` (hub page with a card per variant, text from `hub`) and `dist/<slug>/index.html`.
- `.github/workflows/pages.yml` — GitHub Pages deploy on push to `main`.
- Git repository pushed to `suwanporung-th/resume`. Cloudflare Worker `peerapat-resume` (static assets, not Pages) is connected to the same repo through Workers Builds; `wrangler.jsonc` owns its build command, `dist` asset directory, and the `resume.songvijit.com` custom domain.
- `wrangler.jsonc` — Cloudflare Worker config; Workers Builds runs `npx wrangler deploy` on push to `main`.
- `.claude/launch.json` — local preview server (`python3 -m http.server 4321 -d dist`).
- `dist/` — build output, git-ignored.

## Local Contracts

- Edit content only in `data/resume.json`; never hand-edit `dist/`.
- Per-role text is keyed by bullet set (`core`, `test`, `fa`, `pm`). A variant's `sets` array is a fallback chain; the first set present on a field wins. Fields may be a plain string/array (shared) or a set-keyed object.
- Source PDFs live in the user's Google Drive folder `17HIqcu52sciiKFoT-swCxlsWcd568Jf3`; the `pm` set comes from the older generic "ProcessEngineering" PDF.
- Asset paths are relative (`./`, `../`) so the same `dist/` works on the GitHub Pages project site (`/resume/`) and the Cloudflare Worker (`/`).
- Every page carries `noindex`: the user shares links only with people involved in a job application. Variant pages do not link back to the hub; `showSwitcher` (default `false`) adds cross-links.
- Print-only (`.print-only`): variant pages show `<siteUrl>/<slug>/` as a text link in the header, and a QR code to `portfolio.url` beside the Portfolio Project. Do not add a QR to the resume itself; it duplicates the paper.
- Every variant must print to exactly 1 A4 page (matching the original PDFs in Drive); check with headless Chrome `--print-to-pdf` after content or print-style changes. `senior-test-engineer` is the tightest (about 20 mm spare), so test it first. Verify QR changes by decoding them (e.g. `BarcodeDetector` in the preview browser).
- Resume content and page UI are English (audience is employers); README and code comments are Thai.

## Work Guidance

## Verification

- `node build.mjs` must finish and list every variant slug; then preview via the `resume` launch config.

## Child DOX Index

- None.
