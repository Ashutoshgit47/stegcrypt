# StegCrypt CSS & UI/UX Bugs

## Overview
- **Project**: StegCrypt - Steganography & Cryptography Tool
- **Analysis Date**: 2026-04-14
- **Focus**: CSS & UI/UX Issues Only

---

## UI/UX Bugs

### Bug #1: Mobile Mode Toggle Hidden on Small Screens
- **Location**: Header.tsx:75-89
- **Issue**: The mode toggle button uses `hidden sm:flex`, making it invisible on small mobile screens
- **Impact**: Users on small devices cannot switch between Quick/Expert mode
- **Fix**: Change to visible or provide alternative access

### Bug #2: Decode Button Uses Native Button Instead of shadcn/UI
- **Location**: Decode.tsx:375-385
- **Issue**: Uses `<button>` instead of `<Button>` component, causing inconsistent styling with other buttons
- **Impact**: Different hover/active states compared to other buttons on page

### Bug #3: Password Generator Input Readonly But Focusable
- **Location**: PasswordGenerator.tsx:145-151
- **Issue**: Password input is readonly but can receive focus, confusing users who cannot type
- **Impact**: Poor UX - users may try to edit the generated password

### Bug #4: FileDropzone File Input Missing Focus States
- **Location**: FileDropzone.tsx:117-122
- **Issue**: File input has `opacity-0` covering entire area but no visible focus indicator when focused
- **Impact**: Keyboard users can't see when file input is focused

### Bug #5: Mobile Navigation Lacks Focus Styles
- **Location**: Header.tsx:136-150
- **Issue**: Mobile nav links have hover states but no visible focus states for keyboard navigation
- **Impact**: Keyboard users can't see focused items in mobile menu

### Bug #6: Capacity Bar Zone Markers Incorrect
- **Location**: CapacityIndicator.tsx:66-69
- **Issue**: Second marker uses `w-[30%]` but should align with 80% threshold
- **Impact**: Visual confusion - markers don't accurately represent the 50% and 80% thresholds

### Bug #7: Tool Tabs Not Keyboard Accessible
- **Location**: Tools.tsx:576-583
- **Issue**: Tabs lack proper ARIA roles and keyboard navigation (`role="tab"`, `aria-selected`, keyboard handlers)
- **Impact**: Screen reader and keyboard users cannot properly navigate tool tabs

### Bug #8: Processing Stages Not Announced to Screen Readers
- **Location**: ProcessingStages.tsx
- **Issue**: No ARIA live regions to announce stage changes to screen readers
- **Impact**: Screen reader users don't know processing progress

### Bug #9: Dark Mode Toggle Icon Positioning
- **Location**: Header.tsx:94-98
- **Issue**: Both sun and moon icons are rendered, using CSS positioning to show/hide - adds unnecessary DOM elements
- **Impact**: Minor - works correctly but inefficient

### Bug #10: Password Length Slider Missing ARIA
- **Location**: Tools.tsx:515
- **Issue**: Range input lacks `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, and `aria-label`
- **Impact**: Screen reader users don't know the slider value

### Bug #11: Clipboard Operations Don't Show Error States
- **Location**: Decode.tsx:206-213, Tools.tsx:36-48
- **Issue**: Clipboard copy operations don't handle failures gracefully or show error states
- **Impact**: Silent failures if clipboard permission denied

### Bug #12: Form Validation Errors Not Visually Prominent
- **Location**: Encode.tsx:200-220
- **Issue**: Form validation uses toast notifications but doesn't show inline error states on invalid fields
- **Impact**: Users may miss validation errors

### Bug #13: Loading States Inconsistent
- **Location**: Various components
- **Issue**: Some buttons show loading spinners, others show "Processing..." text
- **Impact**: Inconsistent UX during async operations

### Bug #14: No Empty State for Decode Output
- **Location**: Decode.tsx:319-357
- **Issue**: Output section only renders when there's content - no placeholder/empty state shown
- **Impact**: Visual jump when output appears

### Bug #15: Image Converter Missing Loading Progress
- **Location**: Tools.tsx:295-341
- **Issue**: Image conversion shows spinner but no actual progress indicator for large files
- **Impact**: Users may think app froze on large image conversion

---

## CSS Issues

### CSS #1: Duplicate Animation Definitions
- **Location**: index.css:45-66 vs tailwind.config.ts:97-116
- **Issue**: Fade-in animation defined in both CSS @theme and tailwind.config.ts with different durations
- **Impact**: Confusing - which one actually applies?

### CSS #2: Unused Float Animation Classes
- **Location**: index.css:151-162
- **Issue**: Float-a through Float-e animations defined but not used anywhere in codebase
- **Impact**: Dead code

### CSS #3: Inconsistent Border Radius Values
- **Location**: index.css:34-38, index.css:149
- **Issue**: CSS sets `--radius-*` to 0px but individual components may override with `rounded-none`
- **Impact**: Confusion about which rule takes precedence

### CSS #4: Theme Conflict - Tailwind vs CSS Variables
- **Location**: tailwind.config.ts vs index.css
- **Issue**: Tailwind uses HSL color tokens (`hsl(var(--primary))`) while CSS uses direct hex colors
- **Impact**: Dark mode colors in CSS (lines 107-120) may not match Tailwind config

---

## Visual/Design Issues

### Visual #1: Tool Tab Triggers Overflow on Small Screens
- **Location**: Tools.tsx:572
- **Issue**: 6-column grid on mobile causes overflow or tiny buttons
- **Impact**: Poor mobile experience for Tools page

### Visual #2: No Visual Feedback During Drag Operations
- **Location**: FileDropzone.tsx:103-140
- **Issue**: While dragging, the visual feedback could be more prominent
- **Impact**: Users may not know drag is working

### Visual #3: About Page Feature Cards Fixed Height
- **Location**: About.tsx:79-96
- **Issue**: Cards have fixed grid but varying content lengths could cause alignment issues
- **Impact**: Inconsistent card heights

---

## Summary

| Category | Count |
|----------|-------|
| UI/UX Bugs | 15 |
| CSS Issues | 4 |
| Visual Issues | 3 |
| **Total** | **22** |

Priority: High items are accessibility-related (keyboard navigation, screen reader support).