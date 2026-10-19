# StegCrypt - Steganography & Cryptography Tool

> **Privacy-first encryption and steganography. 100% client-side processing. Your data never leaves your device.**

## What is StegCrypt?

StegCrypt is a web application that combines two powerful security techniques:

1. **Steganography**: The art of hiding secret messages within ordinary files (images, audio)
2. **Cryptography**: The practice of secure communication using encryption

Unlike traditional encryption tools that produce obvious encrypted files, StegCrypt hides the fact that encryption even occurred.

---

## Features

### 🔐 Steganography (Hide Data)

**Encode** - Hide encrypted data inside:
- **Images**: PNG, BMP, WebP (lossless), TIFF
- **Audio**: WAV files

**Decode** - Extract hidden data from:
- Steganographic images/audio
- No one can tell the file contains hidden data

**How it works**:
1. Your message/file is encrypted with AES-256
2. Encrypted data is hidden in image pixels or audio samples
3. Result looks like a normal image/audio file
4. Only someone with the password can extract the data

### 🔒 Cryptography (Encrypt Data)

**Pure encryption mode** - No steganography, just encryption:
- Encrypt any file or text
- Output: `.stegcrypt` encrypted file
- Decrypt on any device with the password

### 🛡️ Security Tools

Built-in cryptographic utilities:

- **Password Generator**: Secure random passwords with entropy meter
- **Hash Calculator**: SHA-1, SHA-256, SHA-384, SHA-512
- **Base64 Encoder/Decoder**: UTF-8 safe conversion
- **Binary Converter**: Text ↔ Binary (010101)
- **Hex Converter**: Text ↔ Hexadecimal
- **Image Converter**: Convert between PNG, WebP, JPEG

---

## How It Works

### Encoding Process

```
[Your File/Text] 
    ↓
[Encrypt with AES-256-GCM + PBKDF2]
    ↓
[Hide in Image/Audio using LSB Steganography]
    ↓
[Normal-looking file with hidden data]
```

### Decoding Process

```
[Image/Audio with hidden data]
    ↓
[Extract encrypted data using password]
    ↓
[Decrypt with AES-256-GCM]
    ↓
[Your original File/Text]
```

---

## Security Details

### Encryption Specifications

| Component | Specification |
|-----------|--------------|
| **Cipher** | AES-256-GCM (Authenticated Encryption) |
| **Key Derivation** | PBKDF2-SHA256 |
| **Iterations** | 100,000 (Standard) / 310,000 (High Security) |
| **Salt** | 128-bit random |
| **IV** | 96-bit random |
| **Authentication** | 128-bit GCM tag |

### Steganography Method

**LSB (Least Significant Bit) Embedding**:
- Hides data in the least significant bits of pixels/samples
- Configurable depth: 1-4 bits
- **1 bit**: Most secure, hardest to detect
- **4 bits**: Highest capacity, more detectable

**Why LSB?**
- Minimal visual/audio difference
- Hard to detect without specialized tools
- Works with any image/audio format

---

## Privacy & Security

### ✅ What We Do

- **100% Client-Side**: All processing happens in your browser
- **Zero Data Transmission**: Nothing sent to any server
- **No Tracking**: No cookies, analytics, or telemetry
- **No Storage**: Files never saved to disk (RAM only)
- **Open Source**: Fully auditable code

### ⚠️ Security Considerations

**Strong Security**:
- ✅ AES-256-GCM encryption (industry standard)
- ✅ PBKDF2 key derivation (prevents brute force)
- ✅ Random salt and IV (prevents rainbow tables)
- ✅ Timing attack protection

**Known Limitations**:
- ⚠️ **Client-side only**: Malware on your device can steal passwords
- ⚠️ **LSB detection**: Advanced forensics can detect hidden data
- ⚠️ **No carrier verification**: Can't check if carrier already has hidden data

**Recommendations**:
1. Use strong passwords (12+ characters, use the generator)
2. Use LSB depth of 1 for sensitive data
3. Use trusted devices only
4. Use incognito mode for extra privacy
5. Clear browser data after use

---

## Browser Compatibility

### Supported Browsers
- Chrome 90+ ✅
- Firefox 90+ ✅
- Safari 15+ ✅
- Edge 90+ ✅

### Requirements
- Web Crypto API (for AES-GCM)
- Web Workers (for background processing)
- Modern JavaScript (ES2020+)

### Mobile Support
- ✅ Full functionality on mobile browsers
- ⚠️ Limited file size on mobile (20MB max)
- ⚠️ LSB depth forced to 1 on mobile

---

## File Format Support

### Image Carriers
| Format | Support | Notes |
|--------|---------|-------|
| PNG | ✅ Full | Best choice, guaranteed lossless |
| BMP | ✅ Full | Uncompressed, excellent for steganography |
| WebP | ✅ Lossless | Must be lossless compression |
| TIFF | ✅ Full | Good alternative to PNG |
| JPEG | ❌ No | Lossy compression destroys data |

### Audio Carriers
| Format | Support | Notes |
|--------|---------|-------|
| WAV (PCM) | ✅ Full | Only uncompressed WAV supported |

### Encrypted File Format
- **Extension**: `.stegcrypt`
- **Contents**: Encrypted binary blob
- **Structure**: Salt + IV + Ciphertext + Auth Tag
- **Can be decrypted**: On any device with password

---

## Capacity Guide

### How Much Can I Hide?

**Images**:
- 1-bit LSB: ~12.5% of file size
- 2-bit LSB: ~25% of file size
- 3-bit LSB: ~37.5% of file size
- 4-bit LSB: ~50% of file size

**Example**:
- 1MB PNG with 1-bit LSB: ~125KB hidden data
- 10MB PNG with 1-bit LSB: ~1.25MB hidden data

**Audio**:
- Similar capacity ratios to images
- WAV files: ~50% capacity at 4-bit LSB

---

## Troubleshooting

### Common Issues

**"Decryption failed - wrong password or corrupted data"**
- Password is incorrect
- File was modified/corrupted
- Wrong LSB depth selected

**"Payload too large for carrier file"**
- Use a larger carrier file
- Use higher LSB depth (less secure)
- Compress the payload first

**"No hidden data found"**
- Wrong file selected
- Wrong LSB depth
- File doesn't contain hidden data

**"Browser not supported"**
- Update to modern browser
- Use Chrome/Firefox/Edge/Safari

### Performance Tips

**Large Files**:
- Use desktop browser (more RAM)
- Close other tabs
- Use smaller payload

**Mobile Devices**:
- Use files under 20MB
- LSB depth limited to 1
- May be slower than desktop

---

## Technical Details

### Cryptographic Implementation

```typescript
// Encryption Process
1. Generate random 128-bit salt
2. Generate random 96-bit IV
3. Derive key using PBKDF2(password, salt, iterations)
4. Encrypt data with AES-256-GCM(key, IV)
5. Output: salt + IV + ciphertext + authTag

// Decryption Process
1. Extract salt, IV, ciphertext, authTag
2. Derive key using PBKDF2(password, salt, iterations)
3. Decrypt with AES-256-GCM(key, IV)
4. Verify authentication tag
5. Output: original data
```

### Steganography Implementation

```typescript
// LSB Embedding
For each pixel RGB channel:
  - Clear least significant bits (1-4)
  - Set bits to match encrypted data
  - Alpha channel always set to 255

// LSB Extraction
For each pixel RGB channel:
  - Read least significant bits (1-4)
  - Reconstruct encrypted data
  - Decrypt to get original file
```

---

## Development

### Local Setup

```bash
# Clone repository
git clone https://github.com/Ashutoshgit47/stegcrypt.git
cd stegcrypt

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### Tech Stack

- **Frontend**: React 18, TypeScript
- **Build**: Vite
- **Styling**: Tailwind CSS
- **Crypto**: Web Crypto API
- **Workers**: Web Workers API
- **Components**: shadcn/ui

### Project Structure

```
stegcrypt/
├── src/
│   ├── workers/          # Background processing
│   │   ├── crypto.worker.ts
│   │   ├── steg.worker.ts
│   │   └── worker-client.ts
│   ├── lib/              # Core logic
│   │   ├── crypto.ts
│   │   ├── steganography.ts
│   │   ├── payload-helper.ts
│   │   └── file-validator.ts
│   ├── pages/            # UI pages
│   │   ├── Encode.tsx
│   │   ├── Decode.tsx
│   │   ├── Tools.tsx
│   │   └── ...
│   └── components/       # UI components
├── public/               # Static assets
└── dist/                 # Production build
```

---

## FAQ

### General

**Q: Is StegCrypt secure?**
A: Yes. Uses industry-standard AES-256-GCM encryption with PBKDF2 key derivation. However, security depends on your password strength and device security.

**Q: Can I use this for illegal activities?**
A: StegCrypt is a privacy tool for legitimate purposes. Use responsibly and legally.

**Q: Is there a size limit?**
A: Desktop: 100MB images, 200MB audio, 50MB payload. Mobile: 20MB all files.

### Technical

**Q: Why LSB steganography?**
A: LSB is simple, effective, and hard to detect without specialized tools. It's been used for decades in digital steganography.

**Q: Can hidden data be detected?**
A: Advanced steganalysis tools can detect statistical anomalies. Use LSB depth 1 and avoid near-capacity embedding for better security.

**Q: What if I forget my password?**
A: There's no password recovery. The data is cryptographically unrecoverable without the password.

### Privacy

**Q: Do you store my files?**
A: No. All processing happens in your browser's memory. Nothing is sent to any server.

**Q: Can you see my data?**
A: No. We have zero access to your data. Everything runs locally in your browser.

**Q: Is there a backdoor?**
A: No. The code is open source and fully auditable. No backdoors, no master keys.

---

## License & Credits

### License
MIT License - Free for personal and commercial use

### Credits
- Built with React and TypeScript
- UI components from shadcn/ui
- Icons from Lucide
- Crypto via Web Crypto API

### Links
- **GitHub**: https://github.com/Ashutoshgit47/stegcrypt
- **Issues**: https://github.com/Ashutoshgit47/stegcrypt/issues
- **Live Demo**: https://stegcrypt.pages.dev

---

## Disclaimer

StegCrypt is provided "as is" for educational and legitimate privacy purposes. 

**Users are responsible for**:
- Compliance with local laws
- Proper password management
- Secure handling of encrypted data
- Understanding security limitations

**Not recommended for**:
- Highly sensitive government secrets
- Situations requiring deniable encryption
- Protection against advanced nation-state adversaries

Use at your own risk. The developers assume no liability for any misuse or security breaches.

---

**Made with ❤️ for privacy-conscious users worldwide.**
