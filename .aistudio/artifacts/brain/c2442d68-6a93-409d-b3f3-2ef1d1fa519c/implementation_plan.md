# Collapsible Navigation Bar & Stacked Workout Phases

Architects a fully responsive, collapsible left-hand navigation menu—featuring an icon-only slim rail toggle for desktop/tablet screens and an off-canvas slide-out drawer for mobile phones—working in synergy with the stack-by-stack expandable workout routine phases.

## User Review & Critical Decisions

> [!IMPORTANT]
> This plan addresses your request to reclaim horizontal space on mobile phones and desktops while keeping all navigation, workout tools, and routine phases easily accessible:

- **Confirmed Decision 1 — Dual-Mode Collapsible Sidebar**:
  - **Desktop / Tablet (`md:` breakpoint and above)**: Provide an expand/collapse toggle button (`PanelLeftClose` / `PanelLeft`) in the sidebar header. When collapsed, the sidebar transitions smoothly from full width (`w-60` / 240px) to a sleek icon-only slim rail (`w-16` / 64px) with tooltips, expanding available content width by 176px for 3D exercise models, tempo timers, and charts.
  - **Mobile Phones (`< md` breakpoint)**: Add a hamburger menu button (`Menu`) to the top mobile header that slides open a lightweight, full-height mobile navigation drawer with a darkened backdrop overlay. Selecting any section smoothly scrolls to the target and automatically closes the drawer.
- **Confirmed Decision 2 — Persistent Sidebar State**:
  - Store the desktop collapsed preference in `localStorage` (`morning20_sidebar_collapsed`) so the athlete's preferred layout persists across reloads and workout sessions.
- **Confirmed Decision 3 — Stack-by-Stack Expandable Routine Phases**:
  - Keep all 4 workout phases (Phase 1: Pre-Workout Prep, Phase 2A: Dynamic Mobility, Phase 2B: 20-Min Hypertrophy Circuit, Phase 3: Post-Workout Recovery) in an accordion stack that defaults to collapsed on initial load.
  - Clicking a phase header toggles its expansion state; clicking sidebar/mobile nav links automatically expands the targeted phase and scrolls to it.

---

## 1. Overview & Core Concept

- **Problem**: On small screens, split windows, and mobile devices, a fixed 240px sidebar consumes too much horizontal space, crowding 3D canvas viewports and exercise metrics. Meanwhile, phone users need a clean way to access the full menu without cluttering the screen.
- **Solution**:
  1. **Adaptive Sidebar**: Switches between full expanded rail (`w-60`), compact icon rail (`w-16`), and off-canvas mobile drawer (`fixed inset-0 z-50`), maximizing screen presence on both phone and desktop.
  2. **Expandable Phases Stack**: Organizes the workout progression into 4 clean, collapsible steps with instant status summaries and quick "Expand All" / "Collapse All" controls.

---

## 2. User Experience & Visual Design

- **Desktop Experience (`≥ 768px`)**:
  - **Expanded Mode (`w-60`)**: Shows brand mark, "Morning 20" title, streak status, full text labels for navigation items, Gemini Coach button, and bottom utilities (Theme, Calibrate, Settings, Log Out).
  - **Collapsed Icon Rail Mode (`w-16`)**: Collapses down to centered icons with accessible `title` tooltips, a compact "M20" badge, theme toggle icon, and a single-click expand button. Main content area seamlessly expands to fill the viewport.
- **Mobile Experience (`< 768px`)**:
  - **Top Sticky Bar**: Compact 48px header showing brand mark, streak day, Gemini Coach trigger, theme toggle, and a hamburger menu button (`Menu`).
  - **Slide-out Navigation Drawer**: Clicking the hamburger icon triggers an animated slide-in sheet (`translateX(0)`) containing all navigation destinations, workout calibration, settings, and streak metrics.
  - **One-Tap Dismissal**: Tapping a link or tapping the dimmed backdrop closes the drawer with zero lag.
- **Workout Routine Phases Stack**:
  - **Initially Collapsed**: Every phase displays a structured, high-contrast header card with phase number pill, descriptive title, status indicators (`2/2 Ready`, `3/3 Drills Primed`, `Timer: 00:00`, `Locked/Unlocked`), and a rotating chevron.
  - **Expand on Header Click**: Clicking any header expands that phase's interactive exercises and tools while preserving other open phases.
  - **Global Header Control**: A top bar features "Expand All Phases" / "Collapse All Phases" and quick phase readiness badges (`P1`, `P2A`, `P2B`, `P3`).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Icon-Rail on Desktop vs. Complete Hidden Drawer**
  - *Chosen Approach*: On desktop (`md:`), collapse to a 64px slim icon rail rather than hiding completely off-screen.
  - *Why*: Allows athletes to jump between Overview, Streak Calendar, Prep Checklist, and Workout Circuit with a single click at any time without needing to open a menu first.
  - *Mobile Handling*: On phones (`< md`), hide the rail completely and use a slide-out drawer because 64px is too wide for 360px–400px phone screens.

- **Decision 2: Synchronized Navigation & Phase Auto-Expansion**
  - *Chosen Approach*: When an athlete taps "Prep Checklist" or "Workout Circuit" in the sidebar or mobile drawer, the app automatically expands the corresponding phase (`phase1` or `phase2a/2b`) before smoothly scrolling.
  - *Why*: Prevents user confusion where clicking a nav link would otherwise scroll to a collapsed, empty-looking card.

---

## 4. Technical Architecture & Component Hierarchy

### Responsive Layout & Navigation Diagram

```
┌───────────────────────────────────────────────────────────────────────────────┐
│ Top Mobile Header (< md): [Menu] [M20 Logo] [Coach] [Theme] [Log Out]        │
└───────────────────────────────────────────────────────────────────────────────┘
┌───────────────────────────────┬───────────────────────────────────────────────┐
│ Left Sidebar (≥ md):          │ Main Content Container:                       │
│ • Toggle: [PanelLeftClose]    │                                               │
│ • Expanded: w-60 (240px)      │ 1. Overview & Athlete Profile Strip           │
│ • Collapsed: w-16 (64px)      │ 2. 30-Day Streak Calendar & Badges            │
│ • Nav: Overview, Streak,      │ 3. Workout Routine Phases Stack:              │
│   Prep, Circuit               │    ├─ [PHASE 1] Pre-Workout Prep & Reminders  │
│ • Gemini AI Coach Button      │    ├─ [PHASE 2A] Dynamic Mobility Drills      │
│ • Utilities: Theme, Settings  │    ├─ [PHASE 2B] 20-Min Hypertrophy Circuit   │
│                               │    └─ [PHASE 3] Cobra Stretch & Protein Fuel  │
└───────────────────────────────┴───────────────────────────────────────────────┘

Mobile Slide-out Drawer (< md, when open):
┌───────────────────────────────┐
│ [M20 Logo]               [X]  │
│ ───────────────────────────── │
│ • Overview                    │
│ • Streak Calendar             │
│ • Phase 1: Prep Checklist     │
│ • Phase 2: Workout Circuit    │
│ • Phase 3: Post-Workout Fuel  │
│ ───────────────────────────── │
│ • AI Coach / Baselines / Theme│
└───────────────────────────────┘ (dimmed backdrop overlay closes on tap)
```

### State & Handler Specifications

- `isSidebarCollapsed`: `boolean` (persisted in `localStorage.getItem('morning20_sidebar_collapsed')`).
- `isMobileMenuOpen`: `boolean` (controls slide-out mobile drawer visibility).
- `expandedPhases`: `Record<string, boolean>` (`{ phase1: false, phase2a: false, phase2b: false, phase3: false }`).
- `togglePhase(id)`: Toggles individual phase expansion.
- `toggleAllPhases()`: Expands or collapses all 4 phases simultaneously.
- `handleJumpToSection(id, domId)`: Closes mobile menu drawer (if open), expands targeted phase, and smoothly scrolls to `domId`.
