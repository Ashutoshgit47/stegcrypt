# StegCrypt — Mobile & Small Device Features & Status

## Features

| Feature | Status | Description |
|---------|--------|-------------|
| Steganography Mode | ✅ Working | Hide AES-256-GCM encrypted data in PNG, BMP, lossless WebP, TIFF, and PCM WAV carriers |
| Cryptography-only Mode | ❌ Not implemented | No route, UI, or `.stegcrypt` writer exists. References in `Help.tsx`, `About.tsx`, `Index.tsx`, `public/pricing.md`, `public/markdown-mirror.md`, `public/llm.txt`, and `public/llms.txt` are stale copy |
| Password Generator | ✅ Working | Cryptographically secure generator with entropy meter; clipboard failures show an error toast |
| Security Tools | ✅ Working | SHA hash generator, Base64, Hex, Binary, password generator, image converter on `/tools` |
| Responsive Design | ✅ Working | Mobile-first layout; 2-column tool tabs; mobile navigation menu |
| Dark Mode | ✅ Working | System theme detection with manual light/dark/system override |
| Touch Input | ✅ Working | Tap targets and the drag/drop zone accept touch input |
| Swipe Navigation | ❌ Not implemented | Navigation uses the menu button; there are no swipe page/route handlers |
| Offline Mode | ✅ Working | Service worker pre-caches the app shell and same-origin static assets |
| PWA Install | ✅ Working | Add to home screen on Android (Chrome) and iOS 17+ (Safari) |
| Share Integration | ❌ Not implemented | No Web Share Target in `manifest.json` and no `navigator.share` usage |
| Mobile File Limits | ⚠️ Not enforced in UI | `constants.ts` defines 20 MB carrier / 10 MB payload limits, but Encode/Decode dropzones use a hardcoded 100 MB carrier cap and 50 MB payload cap |
| LSB Depth Lock | ✅ Enforced in logic | `getLsbDepthForPlatform` forces depth 1. The Decode selector still displays 2-4 in Expert Mode, but the effective depth is 1 and a warning is shown |
| High Security Mode | ❌ Not exposed | The crypto worker's 310K-iteration flag exists, but no UI control sets it on any platform |

### Planned Features

- [ ] **Pull to Refresh** — Gesture-based page refresh in PWA mode
- [ ] **Haptic Feedback** — Vibration on successful encode/decode actions
- [ ] **Native File Picker Integration** — Improved file picker for iOS Files app

---

## Mobile-Specific Behavior

- **File Size Limits**: `constants.ts` caps mobile carriers at 20 MB and payloads at 10 MB. These values are not currently applied by the Encode/Decode dropzones, so a mobile user can select a much larger file. Treat the constants as the intended policy, not an enforced guarantee.
- **LSB Depth**: Fixed at 1 bit in the depth-resolution logic. On Decode, Expert Mode still renders the 1-4 selector; choosing 2-4 shows the "fixed to 1" warning and extraction uses depth 1.
- **High Security Mode (310K PBKDF2)**: Not available in the UI on any platform. Encryption uses the worker default (100K unless the payload's flag bit says otherwise).
- **Text Payload Only in Quick Mode**: File payload requires Expert Mode on all devices.
- **Memory**: Processing needs roughly 3x the carrier size in RAM. Large files on mobile are the most likely source of out-of-memory failures.

---

## Known Issues

| Bug | Severity | Status | Notes |
|-----|----------|--------|-------|
| Mobile 20 MB limit not enforced | Medium | Open | Dropzones hardcode 100 MB; `validateCarrierFile`/`validatePayloadFile` are unused |
| Decode LSB selector misleading on mobile | Low | Open | Options 2-4 remain visible in Expert Mode but resolve to depth 1 |
| Soft keyboard overlap on iOS | Medium | In Progress | Input fields may be hidden by the virtual keyboard on some iPhone models |
| 100vh height glitch on iOS Safari | Low | Investigating | Address bar show/hide causes layout shift on `/encode` and `/decode` |
| TIFF files on iOS Safari | Medium | Platform Limitation | Safari on iOS may not decode TIFF via canvas. Use PNG instead. |
| Overscroll bounce | Low | By Design | Android Chrome's overscroll effect may cause minor visual jitter |

### Recently Fixed

- ~~Hero text wrap and fold truncation on small viewports~~ ✅ Fixed (fluid padding `py-12 md:py-16 lg:py-20` and isolated inline badges)
- ~~Header logo static dark block in mobile light theme~~ ✅ Fixed (`StegCryptLogo` SVG)
- ~~Mobile tab favicon dark theme contrast and missing webmanifest background~~ ✅ Fixed (`#121212` PWA manifest color + vector SVG)
- ~~Mobile About page CTA pointed to generic GitHub profile~~ ✅ Fixed (links author portfolio `https://ashutosh47.pages.dev/`)
- ~~Mobile footer lacked support link~~ ✅ Fixed (styled Bauhaus Ko-fi button `https://ko-fi.com/Y8Y11V9RQ2`)
- ~~Crash on device rotation while processing~~ ✅ Fixed
- ~~Mobile menu not closing after navigation~~ ✅ Fixed
- ~~Mobile mode toggle inaccessible on small screens~~ ✅ Fixed (mobile menu toggle added)
- ~~Same file could not be selected twice after clearing~~ ✅ Fixed
- ~~Oversized file errors appeared only as toasts/not at all~~ ✅ Fixed (inline dropzone errors)
- ~~Download links could be revoked before the browser saved the file~~ ✅ Fixed

---

## Device-Specific Notes

### iOS Safari
- PWA install requires iOS 17+ for full support.
- Use "Add to Home Screen" from the Safari share menu.
- 100vh height inconsistency is a known browser limitation (affects layout slightly on address bar show/hide).

### Android Chrome
- Full PWA support including install prompt and offline app shell.
- Overscroll bounce (pull-to-refresh gesture) may conflict with in-app scroll on some views.

### Small Screens (< 360 px)
- Some UI elements (such as the header mode badge) may truncate on very small screens. The app remains fully functional.

---

## Browser Support (Mobile)

| Browser | Support |
|---------|---------|
| Chrome for Android (latest) | ✅ Full |
| Safari for iOS 17+ | ✅ Full |
| Safari for iOS < 17 | ⚠️ No PWA install |
| Firefox for Android | ✅ Full |
| Samsung Internet | ✅ Full |

---

*Last updated: 2026-10-20*
