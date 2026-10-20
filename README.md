# Morning 20: AI Fitness & Streak Tracker

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC.svg)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.21-000000.svg)](https://expressjs.com/)
[![Tests](https://img.shields.io/badge/Tests-18%20Passed-brightgreen.svg)](https://nodejs.org/api/test.html)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

A science-backed **20-minute daily morning bodyweight hypertrophy and habit tracker** engineered for home-based lean mass progression (baseline: 66 kg → 72 kg) with zero gym equipment. Powered by a strict **3-1-1 tempo protocol**, door-ledge towel grip pull-ups with 4-second negatives, a **30-day streak calendar with Streak Shields**, and an integrated **Gemini AI Biomechanics Coach**.

---

## Table of Contents

- [The Biomechanical Protocol](#the-biomechanical-protocol)
  - [1. Phase 1: 5-Minute Morning Priming](#1-phase-1-5-minute-morning-priming)
  - [2. Phase 2A: Pre-Workout Dynamic Mobility](#2-phase-2a-pre-workout-dynamic-mobility)
  - [3. Phase 2B: 20-Minute Hypertrophy Circuit](#3-phase-2b-20-minute-hypertrophy-circuit)
  - [4. Phase 3: Post-Workout Recovery & Protein Window](#4-phase-3-post-workout-recovery--protein-window)
- [Key Features](#key-features)
  - [3-1-1 Tempo Cadence & Live Stopwatch](#3-1-1-tempo-cadence--live-stopwatch)
  - [30-Day Streak Calendar & Streak Shields](#30-day-streak-calendar--streak-shields)
  - [Milestone Badges & Gamification](#milestone-badges--gamification)
  - [Workout Share Card Generator](#workout-share-card-generator)
  - [Gemini Biomechanics Coach](#gemini-biomechanics-coach)
  - [Liquid Glass Capsule Dock & Poppins Typography](#liquid-glass-capsule-dock--poppins-typography)
- [Technical Architecture](#technical-architecture)
- [Developer Setup & Quickstart](#developer-setup--quickstart)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Development Server](#running-the-development-server)
  - [Running Unit Tests](#running-unit-tests)
  - [Linting & Type Checking](#linting--type-checking)
  - [Production Build](#production-build)
- [Data Storage & Backup](#data-storage--backup)
- [License](#license)

---

## The Biomechanical Protocol

Morning 20 is designed around mechanical tension under bodyweight load, utilizing eccentric control to trigger muscle protein synthesis without needing dumbbells or barbells.

### 1. Phase 1: 5-Minute Morning Priming
- **500ml Filtered Water + 2 Medjool Dates:** Hydrates cellular tissue after 8 hours of sleep and supplies ~36g of fast-digesting glucose to replenish liver glycogen before physical output.
- **Towel Grip Door Ledge Setup:** A standard folded hand towel placed over a sturdy door frame or architectural beam to protect fingertips and recruit the brachioradialis and lats.

### 2. Phase 2A: Pre-Workout Dynamic Mobility
Located at the top of the circuit to lubricate joint capsules before mechanical load:
1. **Arm Circles & Shoulder Dislocates (45s):** 15 forward + 15 backward rotations targeting the rotator cuff, glenohumeral joint, and upper traps.
2. **Leg Swings — Front/Back & Lateral (45s):** 10 sagittal swings + 10 frontal swings per leg for acetabulofemoral hip opening and dynamic hamstring lengthening.
3. **Standing Torso Twists & Reach (45s):** 20 alternating rotations mobilizing the thoracic spine and transverse abdominal core.

### 3. Phase 2B: 20-Minute Hypertrophy Circuit
Performed in 3 continuous rounds using a strict **45s Work / 15s Rest** cadence:
1. **Push-Ups (Chest & Triceps Overload):** Prescribed baseline (e.g. 9 strict reps) at 3-1-1 tempo.
2. **Bulgarian Split Squats (Quad & Glute Hypertrophy):** Rear foot elevated on bed frame, 8-10 reps per side.
3. **Ledge Pull-Ups with Towel Grip (Back & Grip Strength):** 2 full pulls + 4 slow 4-second negatives.
4. **Bed Pike Push-Ups (Anterior Deltoids & Vertical Press):** Elevated feet on bed edge, targeting shoulder mass.

### 4. Phase 3: Post-Workout Recovery & Protein Window
Unlocks strictly after all workout exercises are checked off:
- **01. Post-Workout Cobra Stretch:** 45s prone lumbar extension + 4-7-8 nasal diaphragmatic breathing to lower systemic cortisol.
- **02. High-Protein Breakfast Fuel Bonus:** Target 43g+ protein within 45 minutes of workout completion (e.g., 3 pasture-raised eggs + Greek yogurt bowl).

---

## Key Features

### 3-1-1 Tempo Cadence & Live Stopwatch
- **3-1-1 Cadence:**
  - `3s Eccentric (Lowering)`: Maximizes mechanical tension and muscle fiber micro-damage.
  - `1s Isometric Pause`: Eliminates the stretch reflex at the bottom of reps.
  - `1s Concentric Drive`: Maximizes high-threshold motor unit recruitment.
- **Live Interactive SVG Visualizer:** Animated human stick figure reflecting precise eccentric body depth factors in real time.
- **Session Stopwatch:** Displays `Total Time: XX:XX` in the circuit header, auto-starting when the first exercise begins, with inline Play/Pause and Reset controls.

### 30-Day Streak Calendar & Streak Shields
- **30-Day Horizontal Consistency Strip:** Real-time logging with active days, today indicator, and every 7th day designated as Active Recovery.
- **Rewarding Checkmark Spring Animation:** Custom CSS spring scale animation (`scale(0.35) → scale(1.28) → scale(1)`) providing tactile visual feedback when completing sessions.
- **Streak Shields System:** Up to 3 deployable shields that freeze the unbroken streak if a morning session is missed due to travel or illness.

### Milestone Badges & Gamification
- Tracks and celebrates consistency milestones across 8 distinct achievements:
  - **First Step (Day 1)**: First morning 20 completed.
  - **3-Day Ignition (Day 3)**: Establishing the habit loop.
  - **First Week Strong (Day 7)**: Completing the first 7-day microcycle.
  - **Halfway Mark (Day 15)**: 50% through the 30-day program.
  - **Full Month Master (Day 30)**: Complete 30-day hypertrophy transformation.
  - **Shield Master**: Deploying a Streak Shield to protect unbroken momentum.
  - **Mobility Master**: Priming all joint mobility drills before a workout.
  - **Tempo Champion**: Mastering strict 3-1-1 execution across an entire circuit.
- Filterable by `All`, `Unlocked`, `Streak`, and `Circuit`.

### Workout Share Card Generator
- Generates high-resolution 1080x1350 canvas share cards with athlete name, streak count, session time, and calendar progress.
- One-click `.png` image download and Web Share API support.

### Gemini Biomechanics Coach
- Multi-turn AI coaching drawer powered by the `@google/genai` TypeScript SDK with server-side proxying.
- Provides tailored form modifications (e.g., bed-elevated push-ups for sore shoulders), towel-grip pull-up progressions, and personalized protein breakfast recommendations.
- Local deterministic profile coaching fallback engine ensures zero interruption even if offline or missing API keys.

### Liquid Glass Capsule Dock & Poppins Typography
- **Floating Liquid Glass Capsule Dock:** A modern capsule-shaped pill navbar (`rounded-full`) engineered with ultra backdrop blur (`backdrop-filter: blur(28px) saturate(200%)`), specular rim highlights, and liquid glass active indicators.
- **Poppins Typography:** Clean geometric Google Font `Poppins` utilized across headings, metrics, buttons, badges, and canvas cards.
- **Full Carbon-Slate Dark Mode:** Seamless toggle between light mode and dark mode with persistent user preference.

---

## Technical Architecture

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

### Core Technologies
- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide React, Recharts, Canvas Confetti.
- **Backend:** Express, Node.js, `@google/genai` SDK, `tsx`.
- **Testing:** Node.js native test runner (`node:test`, `node:assert`).
- **Build Tool:** Vite 8.

---

## Developer Setup & Quickstart

### Prerequisites
- **Node.js:** v20.x or higher
- **NPM:** v10.x or higher

### Installation
Clone the repository and install dependencies:
```bash
npm install
```

### Running the Development Server
Starts the Express server with Vite middleware on `http://localhost:3000`:
```bash
npm run dev
```

### Running Unit Tests
Executes the comprehensive 18-suite unit test engine covering tempo calculations, streak logic, protein formulas, shield mechanics, and scroll-spy math:
```bash
npm test
```

### Linting & Type Checking
Runs TypeScript compiler validation with zero emit:
```bash
npm run lint
```

### Production Build
Builds the client bundle for production:
```bash
npm run build
```
To run the production server:
```bash
npm start
```

### Environment Variables
Configure your environment in `.env` (refer to `.env.example`):
```env
# Gemini API Key (optional — app includes deterministic offline coaching fallback)
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

---

## Data Storage & Backup

Morning 20 stores all user data client-side in `localStorage` under isolated keys:
- `morning20_profile_v1`: User height, weight targets, and rep baselines.
- `morning20_calendar_v1`: 30-day completion status and shield deployments.
- `morning20_completed_exercises_v1`: Daily circuit checkoffs.
- `morning20_session_elapsed_v1`: Real-time session elapsed time.
- `morning20_dark_mode_v1`: User theme preference.

### Full Backup & JSON Restore
Athletes can export their complete 30-day journey as a single JSON file or restore from a previous backup using the **Backup & Settings** modal.

---

## License

This project is licensed under the Apache 2.0 License - see the LICENSE file for details.
