# Bug Fixes & Refinements

## UI/UX & Bauhaus Audit (2026-04-12)

### Layout & Alignment
- **[FIXED]** Password Generator overlap on Encode page: Standardized placement inline under the label in a flexible container.
- **[FIXED]** Encode button text clipping: Added `min-h` and standardized sizing for mobile/desktop.
- **[FIXED]** Decode success card styles: Fixed broken background/text utility classes (mapped to explicit hex Bauhaus tokens).
- **[FIXED]** Header Navigation: Reduced padding (px-3) and preventing item wrapping (whitespace-nowrap) to handle all desktop widths.
- **[FIXED]** Report Issue Button: Refactored from a simple link to a bold Bauhaus yellow button with hard-offset shadows and a consistent bug icon style.
- **[FIXED]** Page Container Padding: Added safety padding to main containers to prevent content from hitting screen edges at high zoom levels (125%-150%).

### Bauhaus Design Consistency
- **[ENFORCED]** Global Radius Reset: Set all `--radius` tokens to `0px` in `index.css`.
- **[ENFORCED]** Typography: Standardized on `font-black uppercase tracking-widest` for all headings and primary actions.
- **[ENFORCED]** Hard Shadows: Replaced all soft box-shadows with hard-offset shadows (`3px`, `4px`, `6px`, `8px`) using the Bauhaus palette.
- **[FIXED]** Component Standardisation:
    - **FileDropzone**: Removed dashed borders and rounded corners; added hard shadow and Bauhaus hover state.
    - **CapacityIndicator**: Converted rounded progress bars to square blocks with correct Bauhaus color mapping.
    - **ProcessingStages**: Converted step indicators from circles to squares.
    - **EngineStatus**: Converted status pills to square badges.

### Technical / Styling
- **[FIXED]** Tailwind v4 Build Errors: Migrated custom CSS utilities (`cyber-card`, `bauhaus-btn`) to the `@utility` directive at the top-level of `index.css` to fix compilation failures.
- **[FIXED]** Animation Definitions: Added missing `animate-fade-in` and `animate-bounce-slow` keyframes to the Tailwind `@theme` block.
- **[FIXED]** Decode.tsx Syntax Error: Fixed critical syntax corruption where function definitions were accidentally duplicated/nested during editing.

---

## Runtime & Robustness Pass (2026-10-20)

Scope: user-visible failures found during a full code read-through. No new features, refactors, or redesigns were included.

### Carrier Parsers

- **WAV (`src/lib/wav-codec.ts`)**
  - Chunk walker now stops at the end of the buffer and bounds-checks each header instead of reading past it.
  - Declared chunk size is clamped to the bytes actually remaining (`Math.min(chunkSize, data.length - offset)`).
  - Sample count uses `Math.floor(dataSize / 2)`, so an odd trailing byte cannot create a partial sample.
  - Rejects missing/truncated `fmt` chunks, zero sample rates, and zero channels with descriptive errors instead of producing `NaN`, negative lengths, or empty audio.
- **PNG (`src/lib/png-encoder.ts`)**
  - The encoder now rejects unsupported bit depths, color types, compression methods, filter methods, and interlace methods. `loadImage` catches the failure and falls back to canvas decoding, so unsupported PNGs still open.
  - Chunk loop has explicit bounds checks; the decoded pixel buffer is checked against the size implied by the header.
  - Removed the unused `bytesPerPixel` variable and added the casts required for `Blob`/`BufferSource` typing.
- **BMP (`src/lib/bmp-codec.ts`)**
  - Rejects files where `dataOffset + rowSize * absHeight` exceeds the buffer, preventing out-of-bounds reads on truncated BMPs.

### Embedding & Extraction

- **Transparency preserved (`src/lib/steganography.ts`)**
  - Embedding no longer forces alpha to 255. RGB LSB embedding is unchanged, and transparent PNG regions remain transparent after encoding.
- **Effective LSB depth applied consistently (`src/pages/Encode.tsx`, `src/pages/Decode.tsx`)**
  - Capacity math, embedding, extraction, and carrier analysis now use `effectiveLsbDepth.depth` instead of the raw selector state.
  - Mobile and Quick Mode resolve to depth 1. Decode's auto-probe starts at the same effective depth.
  - On mobile, the Decode selector still displays 2-4 in Expert Mode, but the effective depth is forced to 1 and the warning is shown.
- **Carrier detection by type and extension (`src/pages/Encode.tsx`, `src/pages/Decode.tsx`)**
  - Detection now checks MIME type, file extension, and `audio/x-wav`; a `.wav` file with an empty MIME type is still recognized.
- **Download URL lifetime (`src/pages/Encode.tsx`, `src/pages/Decode.tsx`, `src/pages/Tools.tsx`)**
  - Object URLs are revoked after 1000 ms instead of immediately, which prevents cancelled downloads in Firefox and Safari.

### UI & Error Handling

- **FileDropzone (`src/components/shared/FileDropzone.tsx`)**
  - Resets `input.value` after each selection so choosing the same file again still fires `change`.
  - Validates maximum size itself and renders the error inline; clearing a file also clears the error.
- **Password generator (`src/components/shared/PasswordGenerator.tsx`)**
  - Clipboard write failures now show a destructive toast instead of failing silently.
- **Tools page (`src/pages/Tools.tsx`)**
  - Hash failures show a toast instead of leaving the UI unchanged.
  - Hex decoding rejects non-hex characters before conversion.
  - Password length is clamped to 8-64 in both the slider and number input.
  - WebP output is labeled "WEBP (Lossy)" and the note correctly says only PNG output is lossless.
  - Download extension is derived from `blob.type` rather than always using `.png`.
- **Payload errors (`src/lib/payload-helper.ts`)**
  - Replaced `new Error(message, { cause })` (not in the project's TS lib target) with a DEV-only `console.warn` plus a plain `Error`.
- **Favicon and PWA icons (`index.html`, `public/manifest.json`, `public/favicon/`)**
  - **What was broken:** The icon pipeline used a `foreignObject`/HTML snapshot (reported at ~61 KB) instead of a self-contained vector. Chrome rendered it as a mostly blank/cropped image, so the tab icon was unreliable. The broken artifact was not committed, so the failure cannot be reproduced from git history.
  - **Fix:** Added the updated icon bundle at `public/` root and switched `index.html` to those root paths; `public/favicon/` remains the mirror used by the manifest and service worker. `index.html` now links the 96x96 PNG, SVG, ICO, 180x180 Apple touch icon, and `/manifest.json`. `public/manifest.json` uses the 96/192/512 PNGs with corrected shortcut metadata, and `sw.js` precaches the `/favicon/...` mirror. The unusable SVG was replaced with a clean 64x64 vector of the same folder-and-lock icon.
  - **Theme behavior:** `public/favicon.svg` includes a `prefers-color-scheme: dark` rule, and `ThemeContext.tsx` also writes a theme-specific SVG data URI to the SVG `<link rel="icon">` so the tab icon follows the in-app Light/Dark/System setting.
  - **Verification:** The vector was rendered in headless Chrome; the icon links and manifest return 200 in the production preview. `manifest.json` and both `site.webmanifest` copies parse as JSON.
  - **Cleanup note:** The same icon files exist at `public/` root and in `public/favicon/`. Keep both paths synchronized until the duplicate set is consolidated.
- **Hero Title Line-Wrap Artifact (`src/pages/Index.tsx`)**
  - **Symptom:** At some widths the red `PLAIN` badge wrapped at its leading space, leaving a thin red sliver on the previous line.
  - **Root cause:** The red span contained a literal leading space (`> Plain</span>`) and was inline-level, so the browser could break before the visible text while retaining the span background.
  - **Fix:** Removed the leading space, made `PLAIN` and `SIGHT` standalone `inline-block` badges, added `leading-[1.15]`, an explicit `<br className="hidden sm:inline" />` after "in", and `{' '}` separators. Container padding changed from `py-16 md:py-24` to `py-12 md:py-16 lg:py-20`.
  - **Caveat:** The reduced padding improves first-screen density, but whether "CHOOSE YOUR MODE" is fully above the fold still depends on viewport height, browser chrome, and text scaling. Do not treat "above the fold" as guaranteed on every device.
- **Theme-Adaptive Logo & Tab Favicon (`src/components/shared/StegCryptLogo.tsx`, `src/contexts/ThemeContext.tsx`, `src/components/layout/Header.tsx`)**
  - **What was broken:** The header used a static `<img src="/favicon.svg">`; its dark artwork disappeared or looked like a dark block in light mode. The tab favicon also lacked a reliable light/dark treatment.
  - **Fix:** Added `StegCryptLogo.tsx` as an inline SVG with Tailwind `fill-*`/`stroke-*` plus `dark:` variants and `transition-colors`. Replaced the header `<img>` with `<StegCryptLogo className="h-9 w-9 shrink-0" />`. `ThemeContext.tsx` resolves `light`/`dark`/`system` and updates the SVG icon link with a matching data-URI.
  - **Scope:** The `StegCryptLogo` component appears only in the header. The browser-tab icon is the separate data-URI generated by `ThemeContext`, not the header component.
  - **Verification:** Theme toggling updates the root `.dark` class and the SVG icon link; the inline logo inherits the same class-based colors.
- **Author Portfolio & Ko-fi Support CTAs (`src/pages/About.tsx`, `src/components/layout/Footer.tsx`)**
  - **What was wrong:** The About CTA opened a generic GitHub profile instead of the author's portfolio, and the footer had no support link.
  - **Fix:** Replaced the GitHub Profile button with a `Globe` Portfolio button to `https://ashutosh47.pages.dev/`. Replaced the static "No Upload" badge with a Bauhaus Ko-fi anchor (`#72a4f2`, `Coffee` icon) to `https://ko-fi.com/Y8Y11V9RQ2`; both external links use `target="_blank"` and `rel="noopener noreferrer"`.
  - **Verification:** The About page body link and footer anchor match the URLs above.
  - **Open schema mismatch:** `index.html` WebApplication uses the portfolio URL for `author.url`, but `About.tsx` AboutPage `mainEntity.creator.url` still points to `https://github.com/Ashutoshgit47`. See `ai-seo-audit.md` for the exact fix.
- **License & Documentation De-slopping (`LICENSE`, `README.md`)**
  - **MIT license:** The file previously ended mid-sentence at `AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR`. Restored the full standard MIT warranty/liability paragraph and changed the copyright line to `Copyright (c) 2025-2026 Ashutosh Gautam`.
  - **README de-slopping:** Removed emoji clutter and inflated marketing phrasing, reorganized the README into capabilities, formats, limits, architecture, development, and author sections, and added the portfolio/Ko-fi links.
  - **Score caveat:** The `/slopmonster` review reported a clean 5/5. No `deslop.py`, slopmonster scoring script, or saved score output is checked into this repository, so the 5/5 figure is a reported review result and is not independently reproducible from the repo.
  - **Remaining stale README claims:** `README.md` still advertises a standalone Cryptography mode, configurable Encode LSB depth, the unused `steg.worker.ts` runtime, all binary parsing in Web Workers, an available High Security Mode, a steg header containing both metadata length and payload length, and an immediate post-write verification pass. Actual Encode writes a 4-byte `STEG` magic plus 4-byte payload length, downloads without re-extracting, and has no UI for the 310K flag. This docs-only pass did not modify the README; these remain source-documentation gaps.

### Logic & Calculation Verification

- **Capacity indicator (`src/pages/Encode.tsx`) uses a conservative 110-byte estimate.**
  - `Encode.tsx` reports `used = payloadSize + 110`; `analyzeImageCapacity` / `analyzeWavCapacity` already subtract the 8-byte steg header from carrier capacity.
  - Actual packed size is `5 + metadataJsonBytes + payload` (`packPayload`) plus `49 + ciphertext` for crypto (`1` flags, `4` salt length, `16` salt, `12` IV, `16` GCM tag) plus the `8`-byte steg header. Text metadata is roughly 41-45 bytes; file metadata includes the filename and MIME type and can be larger.
  - The 110-byte figure is therefore a UX estimate, not an exact guarantee. It is slightly conservative for text payloads because it includes the already-subtracted 8-byte header, and it can undercount file payloads with long names/MIME types.
- **Decode capacity display uses the initial depth, not the auto-probed depth.** The sidebar calls `analyzeImageCapacity`/`analyzeWavCapacity` with `lsbDepthValue` (1 in Quick mode and on mobile). Auto-probing can later find a payload embedded at 2-4 bits, so the pre-decode capacity can understate the carrier. This is display-only; extraction itself probes 1-4.
- **`validateCapacity` (`src/lib/file-validator.ts`) is inconsistent and unused.**
  - It adds only 48 bytes (`16 + 12 + 16 + 4`), omitting the 1-byte flags field, metadata wrapper, metadata JSON, and the 8-byte steg header. If it were wired into Encode/Decode, it would allow payloads that later fail the real capacity check.
  - Current Encode/Decode flows use `packedData.byteLength > maxCapacity` plus the 110-byte UI estimate, so `validateCapacity` is dead validation code. Either align it with the real packing formula or remove it when code changes are in scope.
- **Mobile limits are declared but not enforced.** `FILE_LIMITS.mobile` is 20 MB for carriers and 10 MB for payloads. Encode/Decode pass `maxSize={100}` (carrier) and Encode passes `maxSize={50}` (payload) to `FileDropzone`; `validateCarrierFile`/`validatePayloadFile` are not called. The docs' "not enforced" status is correct.
- **LSB depth is forced to 1 on mobile.** `getLsbDepthForPlatform` returns depth 1 with `forced: true` on mobile; the Decode selector still renders 2-4 and shows a warning. Encode has no depth selector, so its `lsbDepth` state remains `'1'`.
- **The "Argon2" option is actually a PBKDF2 high-security flag.** `Encode.tsx` passes `useArgon2` to the worker; `crypto.worker.ts` treats that boolean as `useHighSecurity`, raising PBKDF2 from 100,000 to 310,000 iterations and setting `FLAG_HIGH_SECURITY`. Decryption reads the flag and derives with 310,000 iterations when set. No Argon2 implementation exists, and no UI control currently sets the flag.
- **PWA manifests are split.** The active manifest is `/manifest.json` (dark `#121212` background/theme, shortcuts, 96/192/512 icons). `public/site.webmanifest` is a dark-theme copy but is not linked; `public/favicon/site.webmanifest` still has white `#ffffff` theme/background values. Only `manifest.json` should be treated as authoritative.

### Verification

- `npm run lint`: 0 errors, 9 pre-existing fast-refresh warnings.
- `npm run build`: passes in 1.5s with 0 errors.
- `npx tsc --noEmit`: application code clean; only the pre-existing `src/components/ui/chart.tsx`, `calendar.tsx`, and `resizable.tsx` errors remain.
- Node round-trip harness (esbuild bundle of `wav-codec`, `payload-helper`, `crypto`): 18/18 assertions pass, covering WAV encode/decode, LSB 1-4 embed/extract, oversized `data` chunk clamping, bogus `fmt` rejection, payload packing, filename sanitization, legacy passthrough, and bounds checks.
- Docs-only audit (2026-10-20): source claims above were re-read against the current tree; no project code, assets, or config were changed. The UI/UX audit count was corrected from 22/28 to 21/27 after checking its 27 headings.

### Known Gaps (not fixed in this pass)

- **Cryptography-only mode does not exist.** There is no route, page, or `.stegcrypt` writer. `README.md`, `Help.tsx`, `About.tsx`, `Index.tsx`, `public/pricing.md`, `public/markdown-mirror.md`, `public/llm.txt`, and `public/llms.txt` still describe it.
- **Encode has no LSB depth selector or High Security toggle.** `lsbDepth` is fixed at 1 while encoding, and `useArgon2` is always false. Decode does have an LSB selector.
- **Carrier size validation is not wired into Encode/Decode.** `validateCarrierFile` and `validatePayloadFile` exist but are not called; the dropzones use a hardcoded 100 MB/50 MB cap, so the documented 20 MB mobile limit is not enforced in the UI.
- **Capacity validator is stale.** `validateCapacity` uses a 48-byte overhead, ignores metadata and the 8-byte steg header, and is not called. The live UI uses a 110-byte estimate instead.
- **SEO author URLs are not synchronized.** `index.html` WebApplication `author.url` is the portfolio; `About.tsx` AboutPage `mainEntity.creator.url` is still the GitHub profile.
- **Icon/manifest assets are duplicated.** The same icons exist at `public/` root and `public/favicon/`; `public/site.webmanifest` and `public/favicon/site.webmanifest` are unlinked copies with different theme colors. The active manifest is `/manifest.json`.
- **`src/wasm/js-fallback.ts` is dead code** and writes a 1-byte length with little-endian order while extraction reads big-endian. The active path uses `src/lib/steganography.ts`.
- **`src/workers/steg.worker.ts` / `getStegWorker` are unused.** Embedding runs on the main thread.
- **`tailwind.config.ts` is not loaded by Tailwind v4** (no `@config` directive), so its duplicate animation and HSL theme tokens are dead configuration.
