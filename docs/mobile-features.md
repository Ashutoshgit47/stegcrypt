# StegCrypt — Mobile & Small Device Features & Status

## Features

| Feature | Status | Description |
|---------|--------|-------------|
| Steganography Mode | ✅ Working | Hide encrypted data in PNG, BMP, WebP (lossless), TIFF, and WAV files |
| Pure Cryptography Mode | ✅ Working | Encrypt files or text directly without a carrier; outputs a `.stegcrypt` file |
| Password Generator | ✅ Working | Built-in cryptographically secure password generator with entropy meter |
| Security Tools | ✅ Working | SHA hash generator, Base64, Hex converter on the /tools page |
| Responsive Design | ✅ Working | Fully optimized for screens < 768 px |
| Dark Mode | ✅ Working | Automatic system theme detection with manual override |
| Touch Gestures | ✅ Working | Swipe-friendly navigation and touch-optimized file inputs |
| Offline Mode | ✅ Working | Core functionality works without internet via service worker cache |
| PWA Install | ✅ Working | Add to home screen on Android (Chrome) and iOS 17+ (Safari) |
| Share Integration | ✅ Working | Files can be shared from the device's share sheet to StegCrypt |
| Mobile File Limits | ✅ Working | Automatically enforces lower limits (20 MB) to prevent memory issues |
| LSB Depth Lock | ✅ Working | Forced to LSB depth 1 on mobile for stability and performance |

### Planned Features

- [ ] **Pull to Refresh** — Gesture-based page refresh in PWA mode
- [ ] **Haptic Feedback** — Vibration on successful encode/decode actions
- [ ] **Native File Picker Integration** — Improved file picker for iOS Files app

---

## Mobile-Specific Behavior

- **File Size Limits**: All files are capped at 20 MB on mobile to prevent out-of-memory errors.
- **LSB Depth**: Fixed at 1 bit on mobile for optimal performance. (In Expert Mode users can see the restriction but not override it.)
- **High Security Mode (310K PBKDF2)**: Disabled on mobile by default to prevent the browser from becoming unresponsive.
- **Text Payload Only in Quick Mode**: File payload requires Expert Mode on all devices.

---

## Known Issues

| Bug | Severity | Status | Notes |
|-----|----------|--------|-------|
| Soft keyboard overlap on iOS | Medium | In Progress | Input fields may be hidden by the virtual keyboard on some iPhone models |
| 100vh height glitch on iOS Safari | Low | Investigating | Address bar show/hide causes layout shift on `/encode` and `/decode` pages |
| TIFF files on iOS Safari | Medium | Platform Limitation | Safari on iOS may not support TIFF via canvas. Use PNG instead. |
| Overscroll bounce | Low | By Design | Android Chrome's overscroll effect may cause minor visual jitter |

### Recently Fixed

- ~~Crash on device rotation while processing~~ ✅ Fixed
- ~~Mobile menu not closing after navigation~~ ✅ Fixed

---

## Device-Specific Notes

### iOS Safari
- PWA install requires iOS 17+ for full support.
- Use "Add to Home Screen" from the Safari share menu.
- 100vh height inconsistency is a known browser limitation (affects layout slightly on address bar show/hide).

### Android Chrome
- Full PWA support including install prompt and offline mode.
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

*Last updated: 2026-04-11*
