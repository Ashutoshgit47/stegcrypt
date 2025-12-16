# StegCrypt

Privacy-first, browser-based **steganography and cryptography** web application.

Hide encrypted messages within images and audio files using a combination of **AES-256-GCM encryption** and **LSB steganography**.

## Features

- **100% Local Processing** - All encryption and steganography happens in your browser
- **Military-Grade Encryption** - AES-256-GCM with PBKDF2 key derivation (100K-310K iterations)
- **Multi-Format Support** - Hide data in PNG, BMP images and WAV audio files
- **File Metadata Preservation** - Original filenames and types are restored on decode
- **Binary-Safe Processing** - Pure JS codecs bypass browser interference for reliable steganography
- **No Backend** - No servers, no uploads, no tracking
- **Mobile Responsive** - Works on all devices with optimized limits

## Supported Formats

### Carrier Files (for hiding data)
- **Image**: PNG, BMP (lossless formats only)
- **Audio**: WAV (16-bit PCM)

### File Size Limits
| Platform | Image Carrier | Audio Carrier | Payload |
|----------|---------------|---------------|---------|
| Desktop  | ≤100 MB       | ≤200 MB       | ≤50 MB  |
| Mobile   | ≤20 MB        | ≤20 MB        | ≤10 MB  |

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
- Vite
- Tailwind CSS
- Web Crypto API
- Web Workers

### Performance Optimizations
- **Lazy Loading**: Secondary pages (Security, Help, About) load on-demand
- **Code Splitting**: Separate chunks reduce initial bundle size
- **Font Preconnect**: Faster DNS resolution for Google Fonts
- **Pure JS Codecs**: No external dependencies for image/audio processing

## Security

### Cryptographic Implementation
- **Encryption**: AES-256-GCM authenticated encryption (AEAD)
- **Key Derivation**: PBKDF2-SHA256 (100K iterations, or 310K in High Security Mode)
- **Salt**: 128 bits (16 bytes), cryptographically random
- **IV/Nonce**: 96 bits (12 bytes), fresh per operation
- **Auth Tag**: 128 bits (16 bytes), built-in integrity verification

### Security Hardening
- **Timing Attack Protection**: Uniform error responses prevent oracle attacks
- **Input Validation**: Strict bounds checking on all parsed data
- **Metadata Sanitization**: Filenames limited to 255 chars, dangerous characters filtered
- **Maximum Limits**: 10KB metadata, 49-byte minimum encrypted data

### Privacy Guarantees
- **Local Only**: No data transmission - everything runs client-side
- **No Backend**: No server, no uploads, no analytics
- **Password Requirements**: Minimum 12 characters

## License

MIT License - See LICENSE file for details.

## Author

**Ashutosh Gautam** - [GitHub](https://github.com/Ashutoshgit47)

