# StegCrypt — Desktop (PC) Features & Status

## Features

| Feature | Status | Description |
|---------|--------|-------------|
| Steganography Mode | ✅ Working | Hide AES-256-GCM encrypted data in PNG, BMP, lossless WebP, TIFF, and PCM WAV carriers |
| Cryptography-only Mode | ❌ Not implemented | No route, UI, or `.stegcrypt` writer exists. References in `README.md`, `Help.tsx`, `About.tsx`, `Index.tsx`, `public/pricing.md`, `public/markdown-mirror.md`, `public/llm.txt`, and `public/llms.txt` are stale copy |
| Password Generator | ✅ Working | Cryptographically secure generator with entropy meter; copy failures show an error toast |
| Security Tools | ✅ Working | SHA hash generator, Base64, Hex, Binary, password generator, image converter on `/tools` |
| Drag & Drop | ✅ Working | File upload via drag and drop on all file inputs, with visible drag and focus states |
| Carrier Size Limits | ⚠️ Partial | Dropzones cap all carriers at 100 MB and payloads at 50 MB. The 200 MB desktop audio limit in `constants.ts` is not wired to the UI; `Help.tsx` still advertises 200 MB |
| Expert Mode | ⚠️ Partial | File payloads work. LSB depth 2-4 is selectable only on Decode; Encode has no depth selector. The High Security toggle is not exposed, and the "Argon2" option is misnamed (see Known Issues) |
| Encryption | ✅ Working | AES-256-GCM with PBKDF2-SHA256. Default 100K iterations; the worker's 310K high-security flag is stored in the payload and honored on decrypt, but no UI sets it |
| Dark / Light Mode | ✅ Working | Light, dark, and system themes with theme-adaptive SVG header logo and a separately generated tab favicon |
| Theme-Adaptive Logo | ✅ Working | Vector SVG header logo adapts stroke, fill, and opacity to the active `.dark` class; the browser tab uses the data-URI favicon from `ThemeContext.tsx`, not this component |
| Author Portfolio & Ko-fi | ✅ Working | Dedicated Portfolio link on About page; styled Bauhaus Ko-fi button in footer |
| Keyboard Navigation | ⚠️ Partial | Focus-visible styles on navigation, tabs, and the dropzone. No formal accessibility audit |
| PWA Install | ✅ Working | Installable; service worker registered from `index.html` for offline caching |
| Multi-window Support | ✅ Working | Independent browser tabs/sessions |
| WebP Lossless Carrier | ✅ Working | Detects `VP8L`; rejects lossy WebP with a clear error |
| TIFF Carrier | ✅ Working (input) | Decoded through the browser canvas; output is saved as PNG |
| Transparency Preservation | ✅ Working | PNG alpha is left untouched during LSB embedding |

### Planned Features

- [ ] **WASM Acceleration** — High-performance WebAssembly modules for faster processing of very large files
- [ ] **Split View** — Side-by-side carrier preview and payload editor
- [ ] **Batch Processing** — Encode or decode multiple files at once

---

## Known Issues

| Bug | Severity | Status | Notes |
|-----|----------|--------|-------|
| Cryptography-only mode missing but still advertised | Medium | Open | `README.md`, in-app Help/About/Home copy, and public markdown describe a `.stegcrypt` mode that does not exist |
| No LSB-depth selector on Encode | Medium | Open | `lsbDepth` is fixed at 1 while encoding, so Expert Mode cannot change embedding depth |
| High Security toggle missing; "Argon2" is misnamed | Medium | Open | The worker's `useHighSecurity` flag raises PBKDF2 to 310K and is stored in the payload; the Encode option is named `useArgon2` but no Argon2 implementation exists. `useArgon2` is always false and no UI control sets it |
| Carrier size limits not enforced consistently | Medium | Open | `validateCarrierFile` / `validatePayloadFile` are unused; dropzones hardcode 100 MB carrier / 50 MB payload |
| Capacity estimate and validator disagree | Low | Open | Encode adds a 110-byte UI estimate; `validateCapacity` uses 48 bytes and ignores metadata plus the 8-byte steg header. Actual overhead is metadata-dependent |
| TIFF write not supported | Low | By Design | TIFF input is decoded to canvas and saved as PNG (lossless); the original TIFF container is not preserved |
| Lossy WebP rejection | Low | By Design | Lossy compression destroys embedded bits; users must convert to PNG or use a lossless WebP encoder |
| Very large TIFF files (>100 MB) | Low | Investigating | Canvas decoding can exhaust memory on lower-end machines |

### Recently Fixed

- ~~Hero title line-wrap 1px red sliver artifact~~ ✅ Fixed (isolated inline-block badges)
- ~~Header logo static dark block in light theme~~ ✅ Fixed (`StegCryptLogo` SVG)
- ~~Browser tab favicon dark mode contrast and reported foreignObject breakage~~ ✅ Fixed (pure vector SVG + dynamic data-URI)
- ~~About page linked generic GitHub profile instead of portfolio~~ ✅ Fixed (links `https://ashutosh47.pages.dev/`)
- ~~Footer lacked donation/support CTA~~ ✅ Fixed (links `https://ko-fi.com/Y8Y11V9RQ2`)
- ~~Truncated MIT license text~~ ✅ Fixed (full standard MIT text; copyright `2025-2026 Ashutosh Gautam`)
- ~~README emoji clutter and inflated marketing copy~~ ✅ Fixed (reported 5/5 by `/slopmonster`; no scoring script is checked into the repo)
- ~~Tooltip positioning on resize~~ ✅ Fixed
- ~~Payload capacity indicator ignored encryption overhead~~ ✅ Fixed for the UI estimate (110 bytes); the exact overhead is metadata-dependent and `validateCapacity` remains stale (see Known Issues)
- ~~BMP output not downloading correctly~~ ✅ Fixed
- ~~WAV parser out-of-bounds reads on malformed/truncated chunks~~ ✅ Fixed
- ~~Unsupported PNG variants failing instead of falling back to canvas~~ ✅ Fixed
- ~~Truncated BMP pixel data reading past the buffer~~ ✅ Fixed
- ~~Embedding forced PNG alpha to 255~~ ✅ Fixed (transparency preserved)
- ~~Download URLs revoked before Firefox/Safari could finish saving~~ ✅ Fixed
- ~~Selecting the same file twice did not re-trigger the input~~ ✅ Fixed
- ~~Clipboard failures silent in password generator~~ ✅ Fixed
- ~~WebP converter labeled as lossless and downloads always saved as `.png`~~ ✅ Fixed

---

## Browser Compatibility

| Browser | Support |
|---------|---------|
| Chrome / Edge (latest) | ✅ Full |
| Firefox (latest) | ✅ Full |
| Safari 17+ | ✅ Full |
| Safari < 17 | ⚠️ Limited — PWA install not available |
| Opera | ✅ Full |

---

## Performance Notes

- Files are processed entirely in memory. For very large payloads (>50 MB), ensure you have at least 3× the file size available in RAM.
- Higher LSB depth increases capacity per pixel; it does not make embedding faster. Depth 3-4 also makes modifications easier to detect.
- Font-display swap is used to prevent render-blocking during page load.
- Manual chunk splitting keeps vendor libraries separate from application code.

---

*Last updated: 2026-10-20*
