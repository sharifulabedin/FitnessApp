# 3D Exercise Biomechanics & Pose Alignment Fix

Fixes the broken skeletal positions and inverted limbs on the `lowpoly_male.fbx` 3D character across all exercises—especially the **20-Minute Full-Body Hypertrophy Circuit**—by anchoring all keyframe rotations to each bone's native bind-pose orientation, grounding feet and hands to the studio floor and aligned 3D props, and adding the missing dual-phase Warm-Up animation.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following design and biomechanical decisions incorporate your confirmed preferences before code execution:

- **Confirmed Decision 1 — Aligned 3D Studio Equipment Props**: Display 3D equipment props (elevated bed/box for Bulgarian Split Squats and Bed Pike Push-Ups, overhead pull-up bar with support pillars for Ledge Pull-Ups, and floor hand pads/mat for Push-Ups and Cobra) simultaneously with the `lowpoly_male.fbx` character, calibrated so the hands and feet make accurate physical contact.
- **Confirmed Decision 2 — Dual-Phase Warm-Up Animation (`poseType: 'warmup'`)**: Implement the first exercise card (*Warm-Up: Lunge Twists & Scapular Push-Ups*) as an alternating loop that transitions between a deep runner's lunge with thoracic rotation toward the lead knee and a prone plank scapular push-up protraction/retraction.
- **Confirmed Decision 3 — Bind-Pose Relative Direction Kinematics**: Compute all skeletal keyframe rotations relative to each bone's actual FBX bind-pose quaternion and local axis orientation rather than overwriting bones with zero-identity quaternions.

---

## 1. Overview & Core Concept

- **What It Does**: Delivers anatomically accurate, grounded 3D exercise demonstrations using the `lowpoly_male.fbx` model for all 6 exercises in the 20-Minute Full-Body Hypertrophy Circuit and all 3 Pre-Workout Dynamic Mobility drills.
- **Why Positions Were Breaking**:
  1. **Overwritten Non-Zero Bind Poses**: In `lowpoly_male.fbx`, the thigh bones (`mixamorigLeftUpLeg` / `RightUpLeg`) have a `±170.8°` Z-axis bind rotation and the upper arms have an A-pose bind rotation (`31.5°` X-axis). Overwriting their quaternions with zero-based Eulers flipped the legs `170°` upside-down into the air and twisted the shoulders.
  2. **Inverted Pitch & Knee Axes**: In the FBX coordinate frame (`+Z` forward, `+Y` up), tilting into a prone plank requires `+X` hip rotation (previously `-X` tilted the character onto their back), and because the leg bones are inverted `180°` in Z, forward hip flexion is `-X` while natural knee flexion is `+X` (previously reversed, causing backward knee hyperextension).
  3. **Missing `'warmup'` Pose Handler**: Exercise #1 in the 20-Minute Hypertrophy Circuit uses `poseType: 'warmup'`, which fell through to a static standing idle clip.
  4. **Hidden Props When FBX Loaded**: Equipment props (bed edge, pull-up bar, floor pads) were hidden whenever the FBX model mounted, leaving elevated exercises floating in mid-air.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  - **20-Minute Full-Body Hypertrophy Circuit Cards & Live Workout Modal**:
    1. **Step 1 — Warm-Up (Lunge Twists & Scapular Push-Ups)**: Character performs a deep runner's lunge with thoracic spine rotation toward the front knee, then transitions into a prone plank performing scapular protraction/retraction.
    2. **Step 2 — Push-Ups (Drop-Set with 3-1-1 Tempo)**: Character is prone facing the floor (`+Z` head, `-Z` toes), palms planted on floor pads at shoulder width, lowering the chest over 3 seconds with `45°` tucked elbows, holding 1 second above the floor, and pressing to lockout in 1 second.
    3. **Step 3 — Bulgarian Split Squats (Bed Edge)**: Rear foot rests atop the 3D elevated bed/bench prop behind the athlete; front foot is planted flat on the studio floor forward; hips descend vertically over 3 seconds with natural knee flexion (`+X`), pause 1 second at bottom depth, and drive up in 1 second.
    4. **Step 4 — Ledge Pull-Ups (Towel Grip + 4s Negatives)**: Hands grip the overhead 3D bar prop (`y = 1.55m`); torso hangs vertically with ankles crossed, pulling elbows down and driving the chin to bar level before a controlled eccentric lowering.
    5. **Step 5 — Bed Pike Push-Ups**: Feet rest elevated on the 3D bed/box prop behind the athlete while hands are planted on the floor forward; hips form an inverted V-pike and the crown of the head descends forward between the hands in a tripod path.
    6. **Step 6 — Post-Workout Cobra Stretch**: Character lies prone on the studio mat with pelvis grounded, palms planted beneath shoulders, rhythmically extending the thoracic and lumbar spine upward.
- **Visual Identity & Studio Atmosphere**:
  - High-contrast dark slate biomechanical studio (`#090d16`) with 3-point lighting, grounded radial contact shadow, and subtle cyan/crimson muscle & joint activation halos attached directly to the active bones.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Direction-Vector & Bind-Pose Relative Bone Solver**
  - *Chosen Approach*: Snapshot each bone's initial bind-pose quaternion (`userData.bindQuat`) and position (`userData.bindPos`) once upon FBX/GLB parse, and compute keyframe quaternions using directional alignment (`setFromUnitVectors` along each bone's local `+Y` axis) combined with bind-pose delta rotations.
  - *Why*: Eliminates gimbal lock and axis-inversion bugs across arbitrary Mixamo bone rolls (such as the `±170.8°` leg roll and `±90°` clavicle roll), guaranteeing that limbs always bend in the intended anatomical plane.
  - *Alternatives Considered*: Hand-tuning raw world Euler angles, which is brittle when parent bones (like hips or spine) rotate by `90°`.

- **Decision 2: Co-Rendered 3D Equipment Props with FBX Character**
  - *Chosen Approach*: Keep the procedural `ExerciseProps` group visible when `lowpoly_male.fbx` is active (hiding only the fallback cylinder mannequin), and calibrate prop coordinates to match the scaled FBX limb contact points.
  - *Why*: Gives immediate visual context for why the rear foot is elevated in Bulgarian Split Squats and Bed Pike Push-Ups or what the hands are gripping in Ledge Pull-Ups.

---

## 4. Technical Architecture & Data Strategy

### Architecture & Biomechanical Pipeline Diagram

```
┌───────────────────────────────────────────────────────────────────────────┐
│                        Exercise3DViewer Component                         │
│  (Manages Scene, Camera Views, 3-1-1 Tempo Sync & Equipment Props Group)  │
└───────────────────┬───────────────────────────────────┬───────────────────┘
                    │                                   │
                    ▼                                   ▼
┌───────────────────────────────────────┐ ┌─────────────────────────────────┐
│     FBX Bind-Pose Snapshot Store      │ │   Aligned 3D Equipment Props    │
│  • Captures bone.userData.bindQuat    │ │  • Bed/Box (Split Squat & Pike) │
│  • Captures bone.userData.bindPos     │ │  • Overhead Bar (Ledge Pull-Up) │
│  • Preserves native rest hierarchy    │ │  • Floor Pads & Mat (Push/Cobra)│
└───────────────────┬───────────────────┘ └─────────────────────────────────┘
                    │
                    ▼
┌───────────────────────────────────────────────────────────────────────────┐
│               Biomechanical Skeletal Animator Engine                      │
│  • Limb Direction Solver (aims bone +Y axis in character space)           │
│  • 6 Hypertrophy Circuit Clips: warmup, pushup, splitsquat,               │
│    pullup, pikepushup, cobra (strict 5.0s 3-1-1 cadence)                  │
│  • 3 Pre-Workout Mobility Clips: armcircles, legswings, torsotwists       │
└───────────────────┬───────────────────────────────────────────────────────┘
                    │
                    ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                Three.js AnimationMixer & Bone Glow Markers                │
│  • Auto-loops or scrubs to live workout depthFactor (0.0 → 1.0)           │
│  • Updates glowing muscle/joint halos parented to active Mixamo bones     │
└───────────────────────────────────────────────────────────────────────────┘
```

### Interactive Component & State Mapping

- **Pose Switching (`poseType` change)**: Stops the previous mixer action, resets the skeleton to its captured `bindQuat` and `bindPos` snapshot so no residual bone offsets carry over from a previous exercise, generates the new exercise `AnimationClip`, and updates the 3D equipment props and bone glow markers.
- **3-1-1 Live Workout Synchronization**: During active workout sets (`LiveWorkoutModal`), the 5.0-second clip timeline (`0–3s` eccentric, `3–4s` pause, `4–5s` concentric) stays locked to the user's rep cadence; when paused, the timeline scrubs directly to `depthFactor`.
