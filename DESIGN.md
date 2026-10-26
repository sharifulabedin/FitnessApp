# Design System: Morning 20 (Hypertrophy Protocol)

> **Semantic Design Constitution**  
> Generated via `/taste-design` (`stitch-utilities`).  
> Single source of truth for visual hierarchy, tokens, component behaviors, and anti-patterns across the Morning 20 application.

---

## 1. Visual Theme & Atmosphere

- **Core Atmosphere**: Disciplined athletic training lab. The interface combines the clinical precision of sports science with the quiet confidence of an editorial lookbook. It rejects the dark-neon gamification clichés of consumer fitness apps in favor of a calm, authoritative training surface.
- **Density Spectrum**: **7.5 / 10 ("Cockpit Dense")** — High data-density layout with 4-column typographic KPI strips, calendar grids, interval countdowns, and biomechanical guides arranged with strict spatial clarity.
- **Variance Spectrum**: **6.0 / 10 ("Quiet Left Rail / Offset Sheet")** — Desktop layout features an anchor left rail (`w-60 shrink-0`) paired with an offset, framed sheet container with generous internal padding.
- **Motion Spectrum**: **6.0 / 10 ("Fluid Synovial Cadence")** — Spring-physics transitions for UI states, paired with an exact 3-1-1 cadence clock (3s eccentric negative, 1s isometric hold, 1s concentric contraction) for live exercise execution.

---

## 2. Color Palette & Functional Roles

Morning 20 enforces a strict single-accent palette built upon cool slate neutrals and high-contrast text. Saturated colors are reserved exclusively for status and active mechanical tension.

### Base Grounds & Surfaces
- **Ground Slate (Light)** (`#F1F5F9`) — Outer viewport background ground framing the primary content sheet.
- **Ground Obsidian (Dark)** (`#06090F`) — Dark-mode outer canvas base ground.
- **Framed Sheet (Light)** (`#FFFFFF`) — Inset pure white sheet surface hosting all dashboard cards and data tiles.
- **Framed Sheet (Dark)** (`#0E131F`) — Inset deep obsidian sheet surface in dark mode.
- **Sub-Panel Surface (Light)** (`#F8FAFC`) — Secondary container background for nested bento cards and inputs.
- **Sub-Panel Surface (Dark)** (`#111827`) — Dark-mode sub-card background.

### Text & Ink Hierarchy
- **Primary Ink (Light)** (`#0F172A`, Slate-900) — Primary headings, key metrics, and high-emphasis text.
- **Primary Ink (Dark)** (`#F8FAFC`, Slate-50) — High-contrast dark-mode primary text.
- **Muted Steel (Light)** (`#64748B`, Slate-500) — Secondary labels, timestamps, units, and structural metadata.
- **Muted Steel (Dark)** (`#94A3B8`, Slate-400) — Dark-mode secondary labels and axis lines.
- **Hairline Border (Light)** (`#E2E8F0`, Slate-200) — 1px structural dividing lines and card outlines.
- **Hairline Border (Dark)** (`#1E293B`, Slate-800) — Dark-mode 1px structural borders.

### Functional Accent & Status
- **Hypertrophy Rose (Primary Accent)** (`#F43F5E`, Rose-500 / `#E11D48`, Rose-600) — Single primary accent reserved for primary CTAs ("Start 20-Min Session"), active timers, and biomechanical tension vectors. Maximum saturation below 80%.
- **Completion Emerald** (`#059669` / `#10B981`) — Functional status color denoting completed calendar sessions, primed mobility drills, and successful milestones.
- **Active Recovery Muted Slate** (`#64748B` / `#94A3B8`) — Low-saturation indicator for mandatory 7th-day rest/recovery blocks.
- **Streak Shield Cyan** (`#0E7490`, Cyan-700 / `#0891B2`, Cyan-600) — Safeguard indicator for active streak freeze shields with $\ge 4.5:1$ contrast.

### Explicit Color Bans
- **NO Pure Black** (`#000000`) — Always use Ground Obsidian (`#06090F`) or Charcoal Slate (`#0F172A`).
- **NO Neon/Glow Gradients** — Zero `bg-gradient-to-r`, zero cyan/purple neon drop shadows.
- **NO Rainbow Charting** — Maximum 2 saturated hues on any screen (Rose for tension, Emerald for completion; all structure remains neutral slate).

---

## 3. Typography Rules & Architectural Hierarchy

- **Primary Typeface**: `Poppins, sans-serif` (`--font-sans`, `--font-display`) — Geometric clarity with humanist warmth. Tight letter-spacing on display headings (`-0.02em`), comfortable leading on body text (`1.5`).
- **Monospace & Numerical Engine**: `font-variant-numeric: tabular-nums` globally applied to all numbers, timer countdowns, rep targets, weights, and calendar dates to eliminate layout jitter.
- **Heading Scale Hierarchy**:
  - `H1 Display`: 24px (1.5rem) / 30px (1.875rem), font-weight 700, tracking -0.02em.
  - `H2 Section Header`: 18px (1.125rem) / 20px (1.25rem), font-weight 700.
  - `H3 Sub-section / Card Title`: 14px (0.875rem), font-weight 600.
  - `Data Metric KPI Figures`: 28px–32px, font-weight 700, tabular-nums.
  - `Body Copy`: 13px–14px (0.8125rem–0.875rem), max 65 characters per line.
  - `Metadata & Secondary Labels`: 12px (0.75rem), font-weight 500.
- **Minimum Type Size Floor**: Strictly **12px floor**. Text below 11px is banned across all UI components, buttons, and SVG biomechanical annotations.
- **Banned Typography**: `Inter`, generic serifs (`Times New Roman`, `Georgia`, `Garamond`), and all decorative cursive script fonts.

---

## 4. Component Stylings & Interaction States

### A. Buttons & CTAs
- **Primary CTA ("Start 20-Min Session")**: Solid Rose-600 (`#E11D48`), white text, 40px height, rounded-lg (8px), font-weight 600. Flat resting state (0 box shadow). Active state: `active:translate-y-0.5`.
- **Secondary / Action Controls**: Border 1px hairline (`#E2E8F0` / `#1E293B`), neutral background (`#FFFFFF` / `#1E293B`), 36px height. Labeled text (`"Check"`, `"Done"`, `"Reset"`, `"Audio On"`). Icon-only colored square buttons are strictly banned.
- **Touch Targets**: All interactive elements maintain a minimum $44 \times 44\text{px}$ touch envelope on mobile.

### B. Cards & Panels
- **Framed Sheet Container**: Outer sheet uses `rounded-2xl` (16px), 1px hairline border (`#E2E8F0` / `#1E293B`), zero resting box-shadows.
- **Inner Data Cards / Section Panels**: Interior panels use `rounded-xl` (12px), 1px hairline border, flat surface. Corner radii mix is strictly limited to 16px (sheet) and 12px (cards).
- **Typographic Data Tiles (KPIs)**: No tinted icon chip boxes. A KPI consists of a discrete category label (`text-xs text-slate-500`) followed by large tabular figures (`text-2xl font-bold`) and supporting context text.

### C. Biomechanical Movement Guides
- **Stick-Figure Biomechanics**: Dark studio base (`#0F172A`). Limbs, torso, and structural joints use low-saturation slate neutrals (`#E2E8F0`, `#94A3B8`, `#334155`).
- **Dynamic Tension Vector**: Active muscle engagement and trajectory arcs are highlighted strictly in Rose-500 (`#F43F5E`) with 2.5px stroke width.
- **Text Annotations**: Rendered at `fontSize="12"` in `#E2E8F0` Poppins sans-serif.

### D. Checklists & Toggles
- **Checkboxes**: 20px (`w-5 h-5`), rounded-sm, 1px border. Checked state transitions to solid Emerald-600 (`#059669`) with white 14px checkmark icon.

---

## 5. Layout Principles & Grid Systems

- **Left Rail Anchor (Desktop $\ge 1024$px)**: Sticky 240px (`w-60 shrink-0`) sidebar rail containing brand mark, day status, section anchors, AI Coach trigger, and theme switches.
- **Inset Content Sheet**: Desktop content sits inside a framed sheet with 24px–28px internal padding, isolating content from the viewport edge.
- **Mobile First Adaptation ($< 768$px)**: Left rail collapses into a compact 48px sticky top bar (`M20` logo, Day 12 indicator, Coach trigger, Theme toggle). The content sheet adapts with 16px lateral padding and zero horizontal overflow.
- **Dock Ban**: Floating capsule bottom docks (`liquid-glass-dock`) are permanently banned. All navigational and utility controls reside in the left rail or sticky header.
- **Grid Layout**: 4-column data strip on desktop, collapsing cleanly to 2-column grid on tablet and single-column on mobile.

---

## 6. Motion Philosophy & Spring Physics

- **Spring Physics Parameters**:
  ```ts
  transition: { type: 'spring', stiffness: 450, damping: 28 }
  ```
  Provides snappy, athletic responsiveness without rubbery bounce.
- **Interactive Micro-Interactions**:
  - Modal entrances: Scale 0.96 $\rightarrow$ 1.0, Y-offset 8px $\rightarrow$ 0px, opacity 0 $\rightarrow$ 1.
  - Active button press: 1px downward translation (`translate-y-0.5`).
  - Drawer slide: Clean lateral X-axis translation with zero background blur artifacting.
- **Cadence Engine (3-1-1 Tempo)**:
  - 3-second eccentric negative phase.
  - 1-second bottom isometric pause.
  - 1-second explosive concentric drive.
  - Animated progressbar with `role="progressbar"`, live countdown numerals, and synthetic audio cue frequency shifts (660Hz $\rightarrow$ 880Hz).
- **Reduced Motion Support**: All CSS animations and framer-motion transitions respect `@media (prefers-reduced-motion: reduce)`.

---

## 7. Anti-Patterns (Explicit Banned AI Tells)

1. **NO UI Emojis**: System emojis (⚡, 🔥, 🏆, ✕, ⏱️) are banned from UI buttons and headers; use clean Lucide SVG icons (`<Flame className="w-4 h-4" />`, `<X className="w-4 h-4" />`).
2. **NO Icon Chips**: Decorative icons trapped in colored `24px–64px` tinted circles or squares (`bg-rose-100 text-rose-600`) are banned. Icons must be plain, monochrome, and inline with text.
3. **NO Floating Capsule Docks**: Fixed floating bottom pills that occlude content and block footer elements are forbidden.
4. **NO Neon Glows / Glassmorphic Slop**: No `backdrop-blur-xl` on static resting cards, no glowing radial blobs, no pseudo-3D glass borders.
5. **NO Marketing Slogans or AI Clichés**: Words like *"Elevate"*, *"Seamless"*, *"Unleash"*, *"Next-Gen"*, and *"Transform"* are banned. All copy must specify exact protocols: *"3-1-1 Tempo + 4s Eccentric Negatives"*, *"500ml Warm Water + 2 Dates"*, *"45s Lumbar Decompression"*.
6. **NO Fabricated Placeholder Data**: Zero *"John Doe"*, *"Acme Corp"*, or fake round statistics (*"99.99%"*).
7. **NO Tiny Micro-Text**: No text blocks below 11px anywhere in HTML or SVG documents.
