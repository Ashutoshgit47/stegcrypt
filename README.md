# StegCrypt

Client-side steganography web application, installable as an offline-capable Progressive Web App (PWA).

StegCrypt encrypts arbitrary data with AES-256-GCM and embeds it into lossless image or audio files using Least Significant Bit (LSB) steganography.

All processing executes locally in the browser runtime. Files and encryption keys never leave your device.

- **Live Application**: [stegcrypt.pages.dev](https://stegcrypt.pages.dev)
- **Author Portfolio**: [ashutosh47.pages.dev](https://ashutosh47.pages.dev/)
- **Support**: [ko-fi.com/Y8Y11V9RQ2](https://ko-fi.com/Y8Y11V9RQ2)

---

## Core Capabilities

- **Client-Side Execution**: Cryptography and binary parsing run inside browser Web Workers and the Web Crypto API. No backend, no network uploads, zero telemetry.
- **Authenticated Encryption**: AES-256-GCM authenticated encryption (AEAD) paired with PBKDF2-SHA256 key derivation.
- **Carrier Diversity**: Supports PNG, BMP, lossless WebP, TIFF images, and 16-bit PCM WAV audio.
- **Adaptive Extraction**: Decode engine automatically probes and detects 1 to 4 LSB depths when recovering embedded payloads.
- **Auxiliary Security Suite**: Local utilities for SHA hashing (SHA-1 to SHA-512), Base64 encoding/decoding, text-to-hex conversion, and CSPRNG password generation with entropy scoring.
- **Progressive Web App**: Works offline after initial load, installable on desktop and mobile operating systems.

---

## Supported Carrier Formats

| Format | Media Type | Compatibility | Technical Constraints |
|---|---|---|---|
| PNG | Image | Supported | Lossless, pure JavaScript parser bypasses browser canvas color corruption |
| BMP | Image | Supported | Uncompressed raster, ideal for high capacity |
| WebP | Image | Lossless only | Rejects lossy WebP to protect payload integrity |
| TIFF | Image | Supported | Processed via standard raster context; output saved as PNG |
| WAV | Audio | Supported | 16-bit uncompressed PCM |
| JPEG | Image | Unsupported | Lossy DCT compression destroys embedded LSB data |
| MP3 / AAC | Audio | Unsupported | Psychoacoustic compression corrupts bitstream payloads |

---

## Operational Limits

| Context | Image Carrier Cap | Audio Carrier Cap | Maximum Payload |
|---|---|---|---|
| Desktop | 100 MB | 200 MB (target) | 50 MB |
| Mobile | 20 MB (recommended) | 20 MB (recommended) | 10 MB |

---

## Cryptographic & Steganographic Architecture

### Cryptographic Parameters
- **Cipher**: AES-256 in Galois/Counter Mode (GCM)
- **Key Derivation Function**: PBKDF2 with SHA-256
- **KDF Iterations**: 100,000 rounds standard (310,000 rounds high-security flag)
- **Salt**: 16 bytes (128 bits), cryptographically random via `crypto.getRandomValues()`
- **Initialization Vector**: 12 bytes (96 bits) unique nonce per encryption
- **Integrity Tag**: 16 bytes (128 bits) built into GCM authentication

### Steganographic Layout
- **Method**: Least Significant Bit (LSB) replacement
- **Bit Depth**: 1 bit per channel on Encode for maximum carrier fidelity; automatic 1 to 4 bits/channel detection on Decode
- **Header**: 4-byte `STEG` magic signature followed by encoded metadata length and payload length
- **Metadata Handling**: Original file name and MIME type are encrypted inside the payload header and restored during extraction
- **Safety Checks**: Header validation and strict buffer bounds checking prevent out-of-bounds memory errors during extraction

---

## Local Development

### Requirements
- Node.js 18.0 or higher
- npm 9.0 or higher

### Commands

```bash
# Install dependencies
npm install

# Start local development server (defaults to port 8080)
npm run dev

# Run static analysis and lint checks
npm run lint

# Compile production bundle
npm run build

# Preview production build locally
npm run preview
```

### Stack Architecture
- **Framework**: React 19, TypeScript
- **Tooling**: Vite 8 (with manual chunk splitting for vendor modules)
- **Styling**: Tailwind CSS, Bauhaus neo-brutalist design system
- **Runtime APIs**: Web Crypto API, Web Workers (`crypto.worker.ts`), Service Worker (PWA offline caching)

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for the full license text.

## Author

**Ashutosh Gautam**  
- Portfolio: [ashutosh47.pages.dev](https://ashutosh47.pages.dev/)  
- GitHub: [github.com/Ashutoshgit47](https://github.com/Ashutoshgit47)  
- Ko-fi: [ko-fi.com/Y8Y11V9RQ2](https://ko-fi.com/Y8Y11V9RQ2)
