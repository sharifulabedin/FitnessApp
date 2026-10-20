# Implementation Plan: Comprehensive Morning 20 Documentation (README.md)

Comprehensive documentation for **Morning 20: AI Fitness & Streak Tracker**, covering both user-facing workout protocols and developer-level technical architecture, scripts, and testing workflows.

## User Review & Critical Decisions

> [!IMPORTANT]
> The documentation structure is synthesized from your confirmed preferences:
> - **Comprehensive Scope ("All")**: Deep coverage of the 20-minute bodyweight hypertrophy protocol, 3-1-1 tempo cadence, 30-day streak tracking, streak shields, milestone badges, and Gemini AI coaching integration.
> - **Developer Workflows**: Includes complete quick-start commands, NPM scripts (`dev`, `start`, `build`, `lint`, `test`), server proxy architecture, and test suite details.

- **Confirmed Decision 1**: Structure the document into clear, scannable sections: Product Overview, Biomechanical Protocol, Feature Tour, Architecture & Tech Stack, and Developer Setup.
- **Confirmed Decision 2**: Document the live liquid glass capsule navigation dock, dark mode theming, and Poppins typography rules.

---

## 1. Overview & Core Concept

- **What It Does**: Morning 20 is a daily 20-minute morning bodyweight hypertrophy and habit tracker tailored for home-based progression without gym equipment. It guides users through pre-workout mobility, a structured 3-1-1 tempo circuit (with 4-second negatives for door-ledge towel pull-ups), real-time session stopwatch timing, post-workout recovery decompression, and protein timing windows.
- **Target Audience**: Athletes, calisthenics practitioners, and busy professionals seeking lean muscle hypertrophy (e.g. baseline 66kg → 72kg) in a strict 20-minute daily window.
- **Key Value**: Eliminates workout friction with zero equipment, automated streak protection (Streak Shields), interactive biomechanical SVG animations, and a conversational Gemini AI coach.

---

## 2. User Experience & Visual Design

- **Visual Identity & Design System**:
  - *Typography*: Poppins (Google Fonts) across headings, body copy, stats metrics, and canvas share cards; JetBrains Mono for timers and monospace stats.
  - *Theme & Dark Mode*: High-contrast light slate theme paired with a deep Carbon-Slate dark mode (`#0B0F19` background, `#0F172A` cards).
  - *Liquid Glass Capsule Dock*: Floating pill navigation dock (`rounded-full`) engineered with translucent backdrop blur (`28px`), saturation amplification (`200%`), inner rim specular lighting, and glowing rose accent pills.
- **Key Workflows Documented in README**:
  1. **Phase 1: Morning Priming**: 500ml hydration, 2 Medjool dates, and doorway towel setup.
  2. **Phase 2A: Pre-Workout Dynamic Mobility**: Rotator cuff arm circles, hip leg swings, and thoracic torso twists.
  3. **Phase 2B: 20-Minute Hypertrophy Circuit**: Push-Ups, Bulgarian Split Squats, Towel Ledge Pull-Ups, and Pike Push-Ups with live 3-1-1 tempo guidance and session stopwatch.
  4. **Phase 3: Post-Workout Bonus**: Cobra thoracic decompression and +45 minute high-protein refuel window.
  5. **Gamification & Consistency**: 30-day interactive calendar, streak shield deployment, milestone badge unlocks, and canvas share card export.
  6. **Interactive Coach**: Gemini Coach drawer providing personalized form modifications and protein meal plans.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Full-Scope Documentation**:
  - *Chosen Approach*: Deliver an all-inclusive `README.md` that acts as both a user manual and a technical engineering reference.
  - *Why*: Enables athletes to understand the science behind 3-1-1 tempos while giving software engineers full transparency into state management and test suites.
- **Decision 2: Clear Developer Setup Guide**:
  - *Chosen Approach*: Document exact package manager commands, environment variable setup, dev server invocation (`tsx server.ts`), and unit test runners (`node --test`).
  - *Why*: Facilitates instant local onboarding and continuous integration verification.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────┐
│                   Morning 20 System                    │
└───────────────────────────┬────────────────────────────┘
                            │
       ┌────────────────────┴────────────────────┐
       ▼                                         ▼
┌─────────────────────────┐           ┌─────────────────────────┐
│     Client (React 19)   │           │    Backend (Express)    │
│  - Poppins Typography   │  /api/*   │  - Vite Middleware      │
│  - Liquid Glass Capsule │ ────────> │  - Gemini API Gateway   │
│  - Recharts & Canvas    │           │  - Local Fallback Engine│
│  - LocalStorage State   │           └─────────────────────────┘
└─────────────┬───────────┘
              │
       ┌──────┴──────┐
       ▼             ▼
┌─────────────┐ ┌─────────────┐
│ 18 Unit     │ │ 30-Day      │
│ Tests Pass  │ │ Calendar &  │
│ (node:test) │ │ Streak Hub  │
└─────────────┘ └─────────────┘
```

- **Data Models**: Documented structures for `UserProfile`, `CalendarDay`, `ExerciseItem`, `TempoState`, and `MilestoneBadge`.
- **State Persistence**: Browser `localStorage` architecture with atomic key namespacing (`morning20_*`) and full JSON export/import backup capabilities.
- **Developer Scripts**:
  - `npm run dev`: Runs Express full-stack proxy on port 3000 with Vite middleware.
  - `npm test`: Executes the 18-suite unit test engine in `src/utils/fitnessLogic.test.ts`.
  - `npm run lint`: Validates TypeScript strict typing without emitting files.
  - `npm run build`: Compiles optimized production bundle via Vite.
