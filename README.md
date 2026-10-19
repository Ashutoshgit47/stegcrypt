# StegCrypt

Privacy-first, browser-based **steganography and cryptography** web application. Installable as a Progressive Web App (PWA).

Hide encrypted messages within images and audio files using a combination of **AES-256-GCM encryption** and **LSB steganography**. Or, skip the carrier and encrypt files directly with the built-in cryptography mode.

🔗 **Live App**: [stegcrypt.app](https://stegcrypt.app)

---

## Features

- **100% Local Processing** — All encryption and steganography happens in your browser; no data ever leaves your device
- **Military-Grade Encryption** — AES-256-GCM with PBKDF2 key derivation (100K–310K iterations)
- **Dual Mode** — Steganography mode (hide data in files) and Pure Cryptography mode (encrypt without a carrier)
- **Multi-Format Support** — Hide data in PNG, BMP, WebP (lossless), and TIFF images, or WAV audio files
- **Built-in Password Generator** — Cryptographically secure password generator using `crypto.getRandomValues()`
- **Security Tools** — SHA hash generator, Base64 encoder/decoder, Hex converter, and password generator
- **File Metadata Preservation** — Original filenames and types are restored on decode
- **Binary-Safe Processing** — Pure JS codecs bypass browser interference for reliable steganography
- **No Backend** — No servers, no uploads, no tracking
- **PWA Support** — Install as a desktop or mobile app with offline functionality
- **Mobile Responsive** — Works on all devices with optimized file size limits

---

## Supported Carrier Formats

| Format | Type | Support | Notes |
|--------|------|---------|-------|
| PNG | Image | ✅ Full | Recommended; lossless, pure JS codec |
| BMP | Image | ✅ Full | Lossless, excellent for steganography |
| WebP | Image | ✅ Lossless only | Detects and rejects lossy WebP |
| TIFF | Image | ✅ Full | Via browser canvas API |
| WAV | Audio | ✅ Full | 16-bit PCM, pure JS codec |
| JPEG | Image | ❌ | Lossy compression destroys hidden data |
| MP3 | Audio | ❌ | Lossy compression destroys hidden data |

## File Size Limits

| Platform | Image Carrier | Audio Carrier | Payload |
|----------|---------------|---------------|---------|
| Desktop  | ≤ 100 MB      | ≤ 200 MB      | ≤ 50 MB |
| Mobile   | ≤ 20 MB       | ≤ 20 MB       | ≤ 10 MB |

---

## Security Tools

StegCrypt includes a built-in `/tools` page with fully local utilities:

| Tool | Description |
|------|-------------|
| **Hash Generator** | SHA-1, SHA-256, SHA-384, SHA-512 via Web Crypto API |
| **Base64 Encoder/Decoder** | Encode and decode Base64 strings (UTF-8 safe) |
| **Password Generator** | Cryptographically secure random passwords with entropy meter |
| **Hex Converter** | Convert between text and hexadecimal representation |

---

## Progressive Web App (PWA)

StegCrypt can be installed as a standalone app on any device:

- **Desktop**: Click the install icon in your browser's address bar
- **Mobile**: Use "Add to Home Screen" from the browser menu
- **Offline**: Core steganography and cryptography features work without an internet connection

---

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Tech Stack

- React 18 + TypeScript
- Vite (with manual chunk splitting for performance)
- Tailwind CSS + shadcn/ui
- Web Crypto API
- Web Workers
- Service Worker (PWA)

### Performance Optimizations

- **Lazy Loading**: Secondary pages (Security, Help, About, Tools) load on demand
- **Manual Chunk Splitting**: Separate vendor chunks for React, UI, and query libraries
- **font-display: swap**: Fonts load asynchronously without blocking render
- **Pure JS Codecs**: No external dependencies for image/audio processing
- **PWA Caching**: Service worker caches assets for fast repeat loads

---

## Security

### Cryptographic Implementation

- **Encryption**: AES-256-GCM authenticated encryption (AEAD)
- **Key Derivation**: PBKDF2-SHA256 (100K iterations, or 310K in High Security Mode)
- **Salt**: 128 bits (16 bytes), cryptographically random
- **IV/Nonce**: 96 bits (12 bytes), fresh per operation
- **Auth Tag**: 128 bits (16 bytes), built-in integrity verification

### Steganography

- **Method**: LSB (Least Significant Bit) embedding
- **Depth**: 1–4 bits per channel, configurable in Expert Mode
- **Magic Header**: 4-byte STEG header for reliable extraction
- **Verification**: Embedding is verified immediately after writing

### Security Hardening

- **Timing Attack Protection**: Uniform error responses prevent oracle attacks
- **Input Validation**: Strict bounds checking on all parsed data
- **Metadata Sanitization**: Filenames limited to 255 characters; dangerous characters are filtered
- **Maximum Limits**: 10 KB metadata cap, 49-byte minimum encrypted data

### Privacy Guarantees

- **Local Only**: No data transmission — everything runs client-side
- **No Backend**: No server, no uploads, no analytics
- **Password Requirements**: Minimum 12 characters enforced

---

## License

MIT License — See the LICENSE file for details.

## Author

**Ashutosh Gautam** — [GitHub](https://github.com/Ashutoshgit47)
