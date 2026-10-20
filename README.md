# StegCrypt

Client-side steganography and cryptography web application, installable as an offline-capable Progressive Web App (PWA).

StegCrypt encrypts arbitrary data with AES-256-GCM and embeds it into lossless image or audio files using Least Significant Bit (LSB) steganography. It also provides a standalone Cryptography mode to encrypt and decrypt files directly without a carrier.

All processing executes locally in the browser runtime. Files and keys never leave your machine.

- **Live Application**: [stegcrypt.pages.dev](https://stegcrypt.pages.dev)
- **Author Portfolio**: [ashutosh47.pages.dev](https://ashutosh47.pages.dev/)
- **Support**: [ko-fi.com/Y8Y11V9RQ2](https://ko-fi.com/Y8Y11V9RQ2)

---

## Core Capabilities

- **Client-Side Execution**: All cryptography and binary parsing run inside browser Web Workers and Web Crypto API. No backend, no uploads, no analytics.
- **Authenticated Encryption**: AES-256-GCM authenticated encryption (AEAD) paired with PBKDF2-SHA256 key derivation.
- **Dual Operational Modes**:
  - **Steganography Mode**: Embed encrypted payloads invisibly inside images or audio.
  - **Cryptography Mode**: Directly encrypt or decrypt files without requiring a carrier.
- **Carrier Diversity**: Supports PNG, BMP, lossless WebP, TIFF images, and 16-bit PCM WAV audio.
- **Automatic LSB Detection**: Decode engine scans 1 to 4 LSB depths automatically when recovering embedded payloads.
- **Auxiliary Security Suite**: Local utilities for SHA hashing (SHA-1 to SHA-512), Base64 encoding/decoding, text-to-hex conversion, and CSPRNG password generation with entropy scoring.
- **Progressive Web App**: Works offline after initial load, installable on desktop and mobile operating systems.

---

## Supported Carrier Formats

| Format | Media Type | Compatibility | Technical Constraints |
|---|---|---|---|
| PNG | Image | Supported | Lossless, pure JavaScript parser bypasses browser canvas color corruption |
| BMP | Image | Supported | Uncompressed raster, ideal for high capacity |
| WebP | Image | Lossless only | Rejects lossy WebP to protect payload integrity |
| TIFF | Image | Supported | Processed via standard raster context |
| WAV | Audio | Supported | 16-bit uncompressed PCM |
| JPEG | Image | Unsupported | Lossy DCT compression destroys embedded LSB data |
| MP3 / AAC | Audio | Unsupported | Psychoacoustic compression corrupts bitstream payloads |

---

## Operational Limits

| Context | Image Carrier Limit | Audio Carrier Limit | Maximum Payload |
|---|---|---|---|
| Desktop | 100 MB | 200 MB | 50 MB |
| Mobile | 20 MB | 20 MB | 10 MB |

---

## Cryptographic & Steganographic Architecture

### Cryptographic Parameters
- **Cipher**: AES-256 in Galois/Counter Mode (GCM)
- **Key Derivation Function**: PBKDF2 with SHA-256
- **KDF Iterations**: 100,000 rounds standard (310,000 rounds in High Security Mode)
- **Salt**: 16 bytes (128 bits), cryptographically random via `crypto.getRandomValues()`
- **Initialization Vector**: 12 bytes (96 bits) unique nonce per encryption
- **Integrity Tag**: 16 bytes (128 bits) built into GCM authentication

### Steganographic Layout
- **Method**: Least Significant Bit (LSB) replacement
- **Bit Depths**: 1, 2, 3, or 4 bits per channel (configurable in Expert Mode, auto-detected on decode)
- **Header**: 4-byte `STEG` magic signature followed by encoded metadata length and payload length
- **Metadata Handling**: Original file name and MIME type are encrypted inside the payload header and restored during extraction
- **Verification**: Immediate post-write verification pass to ensure payload decodability prior to download

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
- **Runtime APIs**: Web Crypto API, Web Workers (`steg.worker.ts`, `crypto.worker.ts`), Service Worker (PWA offline caching)

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for the full license text.

## Author

**Ashutosh Gautam**  
- Portfolio: [ashutosh47.pages.dev](https://ashutosh47.pages.dev/)  
- GitHub: [github.com/Ashutoshgit47](https://github.com/Ashutoshgit47)  
- Ko-fi: [ko-fi.com/Y8Y11V9RQ2](https://ko-fi.com/Y8Y11V9RQ2)
