# StegCrypt CSS & UI/UX Bugs

## Overview
- **Project**: StegCrypt - Steganography & Cryptography Tool
- **Original analysis**: 2026-04-14
- **Status re-check**: 2026-10-20
- **Focus**: CSS & UI/UX issues only

Line numbers below refer to the original audit and may have drifted. Each item has a current status.

---

## UI/UX Bugs

### Bug #1: Mobile Mode Toggle Hidden on Small Screens
- **Location**: Header.tsx
- **Issue**: The mode toggle button used `hidden sm:flex`, making it invisible on small mobile screens.
- **Status (2026-10-20)**: **FIXED**. The mobile menu now contains an "Active Mode" toggle (`Header.tsx`), and the header badge remains for `sm` and up.

### Bug #2: Decode Button Uses Native Button Instead of shadcn/UI
- **Location**: Decode.tsx
- **Issue**: Used `<button>` instead of `<Button>`, causing inconsistent styling.
- **Status (2026-10-20)**: **FIXED**. The decode action uses the shadcn `Button` component.

### Bug #3: Password Generator Input Readonly But Focusable
- **Location**: PasswordGenerator.tsx
- **Issue**: The generated password input is readonly but can receive focus.
- **Status (2026-10-20)**: **BY DESIGN**. The input is focusable so users can select and copy the password manually. It has `aria-label="Generated password"` and click-to-select. Not a defect.

### Bug #4: FileDropzone File Input Missing Focus States
- **Location**: FileDropzone.tsx
- **Issue**: The invisible file input had no visible focus indicator.
- **Status (2026-10-20)**: **FIXED**. The dropzone wrapper uses `focus-within:ring-4` plus a border/shadow change, so keyboard focus is visible.

### Bug #5: Mobile Navigation Lacks Focus Styles
- **Location**: Header.tsx
- **Issue**: Mobile nav links had hover states but no visible focus states.
- **Status (2026-10-20)**: **FIXED**. Mobile links and the report link use `focus-visible:ring-2 focus-visible:ring-[#D02020]`.

### Bug #6: Capacity Bar Zone Markers Incorrect
- **Location**: CapacityIndicator.tsx
- **Issue**: The second marker used `w-[30%]`, which did not align with the 80% threshold.
- **Status (2026-10-20)**: **FIXED**. Markers are at `left-1/2` and `left-[80%]`, matching the 50% and 80% status thresholds.

### Bug #7: Tool Tabs Not Keyboard Accessible
- **Location**: Tools.tsx
- **Issue**: Tabs lacked ARIA roles and keyboard navigation.
- **Status (2026-10-20)**: **FIXED**. Tabs use the Radix/shadcn `Tabs` primitives, which provide `role="tab"`, `aria-selected`, and arrow-key navigation. The tab list also has an `aria-label`.

### Bug #8: Processing Stages Not Announced to Screen Readers
- **Location**: ProcessingStages.tsx
- **Issue**: No ARIA live regions for stage changes.
- **Status (2026-10-20)**: **FIXED**. The component has `role="status"` and `aria-live="polite"`, plus an `sr-only` description of the active stage.

### Bug #9: Dark Mode Toggle Icon Positioning
- **Location**: Header.tsx
- **Issue**: Both sun and moon icons are rendered and swapped with CSS transforms.
- **Status (2026-10-20)**: **OPEN (low)**. It still works correctly; only the extra DOM node is inefficient. No user-visible impact.

### Bug #10: Password Length Slider Missing ARIA
- **Location**: Tools.tsx
- **Issue**: Range input lacked `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, and `aria-label`.
- **Status (2026-10-20)**: **FIXED**. All four attributes are present, and the number input has its own `aria-label`.

### Bug #11: Clipboard Operations Don't Show Error States
- **Location**: Decode.tsx, Tools.tsx, PasswordGenerator.tsx
- **Issue**: Clipboard failures were silent.
- **Status (2026-10-20)**: **FIXED**. Decode, the Tools `CopyButton`, and the password generator all catch failures and show destructive toasts with manual-copy guidance.

### Bug #12: Form Validation Errors Not Visually Prominent
- **Location**: Encode.tsx, FileDropzone.tsx
- **Issue**: Validation relied on toasts, with no inline field errors.
- **Status (2026-10-20)**: **FIXED (main paths)**. Encode shows inline password-length and password-mismatch messages. FileDropzone shows inline size errors. Capacity and format errors still use toasts.

### Bug #13: Loading States Inconsistent
- **Location**: Various components
- **Issue**: Some buttons show spinners, others show text.
- **Status (2026-10-20)**: **OPEN (low)**. Buttons mostly use `Processing...`/`Converting...` text; the image converter also spins its icon. No functional problem.

### Bug #14: No Empty State for Decode Output
- **Location**: Decode.tsx
- **Issue**: The output section only rendered when content existed, causing a layout jump.
- **Status (2026-10-20)**: **FIXED**. A dashed placeholder card explains that the decoded message or file will appear after clicking Decode.

### Bug #15: Image Converter Missing Loading Progress
- **Location**: Tools.tsx
- **Issue**: Large conversions show only a spinner, with no progress indicator.
- **Status (2026-10-20)**: **OPEN (low)**. Still no byte-level progress; `canvas.toBlob` does not expose progress. The button is disabled while converting and the error path is handled.

---

## CSS Issues

### CSS #1: Duplicate Animation Definitions
- **Location**: `src/index.css` vs `tailwind.config.ts`
- **Issue**: `fade-in` is defined in both places with different durations.
- **Status (2026-10-20)**: **OPEN (low)**. Tailwind v4 does not load `tailwind.config.ts` here (no `@config` directive), so only the `@theme` definition in `index.css` applies. The duplicate config is dead code, not a runtime conflict.

### CSS #2: Unused Float Animation Classes
- **Location**: `index.css`
- **Issue**: `float-a` through `float-e` were defined but unused.
- **Status (2026-10-20)**: **FIXED**. The float animations are no longer present.

### CSS #3: Inconsistent Border Radius Values
- **Location**: `index.css`
- **Issue**: Radius tokens were reset to `0px` while components could override them.
- **Status (2026-10-20)**: **RESOLVED**. Radius tokens are all `0px`, and shared components use square borders/`rounded-none`. No conflicting overrides were found in the shared components.

### CSS #4: Theme Conflict - Tailwind vs CSS Variables
- **Location**: `tailwind.config.ts` vs `index.css`
- **Issue**: The Tailwind config uses HSL tokens while CSS uses direct hex colors.
- **Status (2026-10-20)**: **OPEN (low)**. Same root cause as CSS #1: the config is not loaded under Tailwind v4. `index.css` is the single source of truth. Removing the stale config would be cleanup, not a bug fix.

---

## Visual/Design Issues

### Visual #1: Tool Tab Triggers Overflow on Small Screens
- **Location**: Tools.tsx
- **Issue**: A 6-column grid on mobile caused overflow or tiny buttons.
- **Status (2026-10-20)**: **FIXED**. The grid is `grid-cols-2 sm:grid-cols-3 lg:grid-cols-6` with `h-auto` and `gap-2`.

### Visual #2: No Visual Feedback During Drag Operations
- **Location**: FileDropzone.tsx
- **Issue**: Drag feedback was too subtle.
- **Status (2026-10-20)**: **FIXED**. Dragging changes the border, background, icon colors, and shadow, and offsets the zone by 2px.

### Visual #3: About Page Feature Cards Fixed Height
- **Location**: About.tsx
- **Issue**: Card grid could produce uneven heights with different content lengths.
- **Status (2026-10-20)**: **RESOLVED**. Cards size naturally within the grid; no fixed height is applied. Rows align to the tallest card, which is expected grid behavior.

---

## Summary (2026-10-20)

| Status | Count |
|--------|-------|
| Fixed / resolved | 16 |
| By design | 1 |
| Open (low priority) | 5 |
| **Total** | **22** |

Open items: dark-mode icon swap (#9), loading-state consistency (#13), image-converter progress (#15), duplicate dead Tailwind config (CSS #1, #4).
