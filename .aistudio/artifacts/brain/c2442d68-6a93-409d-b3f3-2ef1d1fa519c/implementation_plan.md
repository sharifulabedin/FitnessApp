# Bottom Navigation Bar & Section Jump Dock

Add an ergonomic bottom navigation bar and floating desktop dock to **Morning 20: AI Fitness & Streak Tracker** so athletes can jump directly to any section of the long-scroll dashboard (**Overview**, **Streak**, **Prep**, **Circuit**, **AI Studio**) or open the **Gemini Coach** with a single tap.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following design and functional choices have been confirmed from your answers and will guide the implementation:

- **Confirmed Decision 1 (Navigation Destinations)**: Include **Overview**, **Streak**, **Prep** (Pre-Workout Checklist & Smart Reminders), **Circuit** (20-Min Hypertrophy Routine), and **AI Studio** as section-jump anchors.
- **Confirmed Decision 2 (Integrated Gemini Coach Tab)**: Replace the standalone floating corner button with a dedicated **Coach** tab directly inside the bottom navigation bar to eliminate bottom-right content overlap and unify all primary actions.
- **Confirmed Decision 3 (All-Viewport Presence)**: Render as an ergonomic edge-to-edge bottom tab bar on mobile viewports and a sleek centered floating dock on desktop viewports.

---

## 1. Overview & Core Concept

- **What It Does**: Provides instant, single-tap smooth scrolling to each major section of the Morning 20 dashboard, automatically highlights the currently visible section as the user scrolls, and opens the Gemini AI Fitness Coach drawer directly from the bar.
- **Target Audience / Persona**: Morning calisthenics athletes navigating between their 30-day streak strip, pre-workout checklist, 20-minute circuit cards, and AI coaching tools on mobile phones or desktop screens.
- **Key Value**: Eliminates scroll fatigue on long pages while reclaiming screen real estate previously occupied by the floating corner button.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Section Jumping**: Tapping **Overview**, **Streak**, **Prep**, **Circuit**, or **AI Studio** smoothly scrolls the viewport (`scrollIntoView({ behavior: 'smooth', block: 'start' })`) to that section with scroll-margin offset (`scroll-mt-6`) so section headings land cleanly at the top.
  2. **Scroll-Spy Active State**: As the user scrolls naturally through the page, an intersection/scroll observer updates the active tab indicator in real time.
  3. **Direct Coach Launch**: Tapping the **Coach** tab in the bottom bar opens the sliding Gemini AI Fitness Coach drawer and highlights the Coach tab while the drawer is open.
- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Material Design 3 tactile navigation bar with translucent frosted glass (`backdrop-blur-md bg-white/90`) and crisp hairline borders (`border-slate-200`).
  - *Color Palette & Mood*: Neutral slate surface (`#FFFFFF` / `#F8FAFC`) with electric rose (`#F43F5E`) active indicator pills and high-contrast slate typography (`#0F172A` active, `#64748B` inactive).
  - *Typography & Hierarchy*: Compact single-line captions (`10px–11px` `Plus Jakarta Sans` font-semibold) stacked below `20px` Lucide icons, ensuring zero two-line wrapping.
  - *Component Styling & Layout*:
    - **Mobile (`< 768px`)**: Fixed full-width bottom bar (`fixed bottom-0 left-0 right-0 z-40 h-16`) with 6 evenly spaced touch targets (`min-h-[44px] min-w-[44px]`), staying well within the 15% mobile sticky height budget.
    - **Desktop (`>= 768px`)**: Centered floating pill dock (`fixed bottom-5 left-1/2 -translate-x-1/2 z-40 rounded-2xl shadow-xl border border-slate-200/90 px-3 py-1.5`) for effortless cursor access.
- **Interactive Feedback & Motion**: Smooth `150ms` color and scale transitions (`active:scale-95`), clear `focus-visible` keyboard rings, and `aria-current="location"` accessibility state on the active section tab.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Unifying Section Jumps + Coach Trigger in One Bar**
  - *Chosen Approach*: A 6-item bar (`Overview`, `Streak`, `Prep`, `Circuit`, `Studio`, `Coach`) where the first 5 items smooth-scroll to their respective DOM section IDs and the 6th item toggles the Gemini Coach drawer.
  - *Why*: Consolidating the floating `Ask Gemini Coach` button into the navigation bar prevents overlapping the right-hand Bento cards on mobile and desktop while keeping the AI Coach 1 tap away at all times.
  - *Alternatives Considered*: Keeping a separate floating Coach button above the bottom bar, which was passed over because stacked fixed elements consume vertical mobile viewport space.
- **Decision 2: Scroll-Spy Synchronization**
  - *Chosen Approach*: Track scroll position against the 5 section anchor offsets (`#overview-section`, `#streak-calendar`, `#prep-section`, `#workout-circuit`, `#visual-studio`) with immediate active state update on click.
  - *Why*: Gives immediate tactile feedback when clicked and keeps the bottom bar accurate during manual scrolling.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       Morning 20 Main Viewport                          │
│                                                                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────────────┐  │
│  │ #overview-section│  │ #streak-calendar │  │     #prep-section     │  │
│  │  Athlete KPIs &  │  │  30-Day Streak   │  │ Pre-Workout Checklist │  │
│  │  Baseline Goals  │  │  Calendar Strip  │  │ & Smart Notifications │  │
│  └────────▲─────────┘  └────────▲─────────┘  └───────────▲───────────┘  │
│           │                     │                        │              │
│  ┌────────┴─────────┐  ┌────────┴─────────┐              │              │
│  │ #workout-circuit │  │  #visual-studio  │              │              │
│  │  20-Min 3-1-1    │  │  1K/2K/4K Image  │              │              │
│  │  Exercise Grid   │  │  Generator Card  │              │              │
│  └────────▲─────────┘  └────────▲─────────┘              │              │
└───────────┼─────────────────────┼────────────────────────┼──────────────┘
            │                     │                        │
            └──────────────┬──────┴────────────────────────┘
                           │ Smooth Scroll + Scroll-Spy
            ┌──────────────┴──────────────────────────────────────────┐
            │        Bottom Navigation Bar / Desktop Dock             │
            │  [Overview] [Streak] [Prep] [Circuit] [Studio] [Coach]  │
            └──────────────────────────────────────────────────┬──────┘
                                                               │ Toggles
                                                    ┌──────────▼──────────┐
                                                    │ Gemini Coach Drawer │
                                                    └─────────────────────┘
```

- **Data Model & State**:
  - `activeSection`: `'overview' | 'streak' | 'prep' | 'circuit' | 'studio'` — tracks which section is currently in view or was most recently jumped to.
  - `isCoachOpen`: `boolean` — controls the sliding Gemini AI Fitness Coach drawer and highlights the `Coach` tab when open.
- **Interactive Component & State Mapping**:
  - Clicking any of the 5 section tabs updates `activeSection`, closes any open drawer if needed, and invokes `document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })`.
  - A passive `scroll` listener computes which section heading is closest to the top viewport threshold and updates `activeSection` automatically.
  - Clicking the `Coach` tab toggles `isCoachOpen` to slide out the multi-turn Gemini Coach drawer.
