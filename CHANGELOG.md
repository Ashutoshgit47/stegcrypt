# Changelog

All notable changes to the StegCrypt project will be documented in this file.

## [1.1.0] - 2026-04-12

### Added
- **Bauhaus Design System**: Implemented a comprehensive design language audit enforcing strict Brutalist/Bauhaus aesthetics.
- **Global Theme Tokens**: Centralized Bauhaus palette (Red, Blue, Yellow, Dark) and square-radius overrides in `index.css`.
- **New CSS Utilities**: Added `.cyber-card` and `.bauhaus-btn` variants via Tailwind v4 `@utility` for high-performance, reusable styling.
- **Improved Animations**: Added `animate-fade-in` and geometry floating animations for a premium visual experience.

### Changed
- **Page Layouts**: Reconstructed `Encode.tsx`, `Decode.tsx`, and `Tools.tsx` to align with the new Bauhaus system.
- **Header Navigation transformed**: Reduced padding and added `whitespace-nowrap` to handle all desktop resolutions.
- **Improved Report Issue UI**: Replaced the ghost link with a high-visibility Bauhaus Yellow button with hard-offset shadows.
- **Component Overhaul**: 
    - `FileDropzone` converted to square-border high-contrast style.
    - `Header` navigation transformed from rounded to square.
    - `CapacityIndicator` and `ProcessingStages` indicators standardized to square geometry.
- **Password Generator UI**: Refactored the generator placement on the Encode page to prevent layout shifts and overlaps at multiple zoom levels.

### Fixed
- **Tailwind v4 Build Pipeline**: Fixed build-time errors relating to utility name resolution and directive nesting.
- **CSS Utility Mappings**: Fixed broken status colors in `Decode.tsx` (success/indicator colors).
- **Responsive Alignment**: Fixed button text clipping and container overflows at 150% browser zoom.
- **Syntax Corruption**: Resolved critical syntax errors in `Decode.tsx` resulting from previous complex edits.
