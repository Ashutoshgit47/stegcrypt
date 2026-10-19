# StegCrypt — Desktop (PC) Features & Status

## Features

| Feature | Status | Description |
|---------|--------|-------------|
| Steganography Mode | ✅ Working | Hide encrypted data in PNG, BMP, WebP (lossless), TIFF, and WAV files |
| Pure Cryptography Mode | ✅ Working | Encrypt files or text directly without a carrier; outputs a `.stegcrypt` file |
| Password Generator | ✅ Working | Built-in cryptographically secure password generator with entropy meter |
| Security Tools | ✅ Working | SHA hash generator, Base64, Hex converter on the /tools page |
| Drag & Drop | ✅ Working | File upload via drag and drop on all file inputs |
| Large File Support | ✅ Working | Up to 100 MB image carriers and 200 MB WAV audio carriers |
| Expert Mode | ✅ Working | Unlocks LSB depth control (1–4 bits), High Security Mode (310K PBKDF2 iterations), and file payload support |
| Dark / Light Mode | ✅ Working | Toggle between themes; respects system preference |
| Keyboard Navigation | ✅ Working | Full keyboard accessibility across all form elements |
| PWA Install | ✅ Working | Installable as a desktop app via browser; offline support via service worker |
| Multi-window Support | ✅ Working | Open multiple browser tabs independently |
| WebP Lossless Carrier | ✅ Working | Detects and accepts lossless WebP; rejects lossy WebP with a clear error |
| TIFF Carrier | ✅ Working | Reads TIFF files via browser canvas API |

### Planned Features

- [ ] **WASM Acceleration** — High-performance WebAssembly modules for faster processing of very large files
- [ ] **Split View** — Side-by-side carrier preview and payload editor
- [ ] **Batch Processing** — Encode or decode multiple files at once

---

## Known Issues

| Bug | Severity | Status | Notes |
|-----|----------|--------|-------|
| TIFF write not supported | Low | By Design | TIFF carrier output is saved as PNG (lossless); original TIFF is not preserved as output format |
| Lossy WebP rejection | Low | By Design | WebP lossy files are correctly rejected; users must convert to PNG first or use a lossless WebP encoder |
| Very large TIFF files (>100 MB) | Low | Investigating | May cause performance issues on lower-end machines due to canvas decoding |

### Recently Fixed

- ~~Tooltip positioning on resize~~ ✅ Fixed
- ~~Payload capacity calculation overhead~~ ✅ Fixed (110-byte overhead accounted for)
- ~~BMP output not downloading correctly~~ ✅ Fixed

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
- Expert Mode with LSB depth 4 is approximately 4× faster than LSB depth 1 for the same carrier, but produces more visually detectable changes.
- Font-display swap is used to prevent render-blocking during page load.
- Manual chunk splitting ensures vendor libraries are cached separately from application code.

---

*Last updated: 2026-04-11*
