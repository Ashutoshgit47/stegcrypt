# Bug Fixes & Refinements

## UI/UX & Bauhaus Audit (2026-04-12)

### Layout & Alignment
- **[FIXED]** Password Generator overlap on Encode page: Standardized placement inline under the label in a flexible container.
- **[FIXED]** Encode button text clipping: Added `min-h` and standardized sizing for mobile/desktop.
- **[FIXED]** Decode success card styles: Fixed broken background/text utility classes (mapped to explicit hex Bauhaus tokens).
- **[FIXED]** Header Navigation: Reduced padding (px-3) and preventing item wrapping (whitespace-nowrap) to handle all desktop widths.
- **[FIXED]** Report Issue Button: Refactored from a simple link to a bold Bauhaus yellow button with hard-offset shadows and a consistent bug icon style.
- **[FIXED]** Page Container Padding: Added safety padding to main containers to prevent content from hitting screen edges at high zoom levels (125%-150%).

### Bauhaus Design Consistency
- **[ENFORCED]** Global Radius Reset: Set all `--radius` tokens to `0px` in `index.css`.
- **[ENFORCED]** Typography: Standardized on `font-black uppercase tracking-widest` for all headings and primary actions.
- **[ENFORCED]** Hard Shadows: Replaced all soft box-shadows with hard-offset shadows (`3px`, `4px`, `6px`, `8px`) using the Bauhaus palette.
- **[FIXED]** Component Standardisation:
    - **FileDropzone**: Removed dashed borders and rounded corners; added hard shadow and Bauhaus hover state.
    - **CapacityIndicator**: Converted rounded progress bars to square blocks with correct Bauhaus color mapping.
    - **ProcessingStages**: Converted step indicators from circles to squares.
    - **EngineStatus**: Converted status pills to square badges.

### Technical / Styling
- **[FIXED]** Tailwind v4 Build Errors: Migrated custom CSS utilities (`cyber-card`, `bauhaus-btn`) to the `@utility` directive at the top-level of `index.css` to fix compilation failures.
- **[FIXED]** Animation Definitions: Added missing `animate-fade-in` and `animate-bounce-slow` keyframes to the Tailwind `@theme` block.
- **[FIXED]** Decode.tsx Syntax Error: Fixed critical syntax corruption where function definitions were accidentally duplicated/nested during editing.
