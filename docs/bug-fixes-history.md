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
  - Moved the provided icon set into `public/favicon/` so Vite copies it into `dist/`.
  - Linked the 96x96 PNG, SVG, ICO, and 180x180 Apple touch icon. The original generated `favicon.svg` was a 61 KB `foreignObject`/HTML snapshot that rendered blank in Chrome; it was replaced with a clean 64x64 vector version of the same folder-and-lock icon.
  - Updated the web manifest to use the 96/192/512 PNG icons and fixed the shortcut icon metadata.
  - Added the new icons to the service worker precache list.

### Verification

- `npx eslint src`: 0 errors, 9 pre-existing fast-refresh warnings.
- `npm run build`: passes.
- `npx tsc --noEmit`: application code clean; only the pre-existing `src/components/ui/chart.tsx`, `calendar.tsx`, and `resizable.tsx` errors remain.
- Node round-trip harness (esbuild bundle of `wav-codec`, `payload-helper`, `crypto`): 18/18 assertions pass, covering WAV encode/decode, LSB 1-4 embed/extract, oversized `data` chunk clamping, bogus `fmt` rejection, payload packing, filename sanitization, legacy passthrough, and bounds checks.

### Known Gaps (not fixed in this pass)

- **Cryptography-only mode does not exist.** There is no route, page, or `.stegcrypt` writer. `Help.tsx`, `About.tsx`, `Index.tsx`, `public/pricing.md`, `public/markdown-mirror.md`, `public/llm.txt`, and `public/llms.txt` still describe it.
- **Encode has no LSB depth selector or High Security toggle.** `lsbDepth` is fixed at 1 while encoding, and `useArgon2` is always false. Decode does have an LSB selector.
- **Carrier size validation is not wired into Encode/Decode.** `validateCarrierFile` and `validatePayloadFile` exist but are not called; the dropzones use a hardcoded 100 MB/50 MB cap, so the documented 20 MB mobile limit is not enforced in the UI.
- **`src/wasm/js-fallback.ts` is dead code** and writes a 1-byte length with little-endian order while extraction reads big-endian. The active path uses `src/lib/steganography.ts`.
- **`src/workers/steg.worker.ts` / `getStegWorker` are unused.** Embedding runs on the main thread.
- **`tailwind.config.ts` is not loaded by Tailwind v4** (no `@config` directive), so its duplicate animation and HSL theme tokens are dead configuration.
