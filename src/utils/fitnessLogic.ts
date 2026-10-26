export interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string;
  heightCm: number;
  heightUnit: 'cm' | 'ft';
  currentWeightKg: number;
  targetWeightKg: number;
  maxPushUps: number;
  maxPullUps: number;
  onboarded: boolean;
}

export interface CalendarDay {
  dayNumber: number; // 1..30
  dateLabel: string; // e.g., "Oct 19"
  weekdayShort: string; // e.g., "Mon"
  isRecoveryDay: boolean; // every 7th day
  completed: boolean;
  isToday: boolean;
  isShielded?: boolean;
  durationSeconds?: number; // total session duration elapsed in seconds
}

export interface ExerciseItem {
  id: string;
  stepNumber: string;
  name: string;
  subtitle: string;
  category: 'warmup' | 'circuit' | 'cooldown';
  rounds: number;
  workSeconds: number;
  restSeconds: number;
  tempo: string;
  prescribedReps: string;
  cues: string[];
  equipment: string;
  targetMuscles: string;
  poseType: 'warmup' | 'pushup' | 'splitsquat' | 'pullup' | 'pikepushup' | 'cobra';
}

export interface TempoState {
  repNumber: number;
  phase: 'Eccentric (Lower 3s)' | 'Pause (Hold 1s)' | 'Concentric (Drive 1s)';
  phaseShort: 'LOWER 3s' | 'HOLD 1s' | 'DRIVE 1s';
  phaseSecond: number;
  phaseProgressPercent: number;
  cycleProgressPercent: number;
  bodyDepthFactor: number; // 0 (top) to 1 (bottom) for live SVG body animation
}

export interface NotificationSchedule {
  enabled: boolean;
  morningWorkoutTime: string; // "07:00"
  proteinDelayMinutes: number; // 45
  hydrationReminder: boolean;
}

export interface MobilityExerciseItem {
  id: string;
  stepNumber: string;
  name: string;
  subtitle: string;
  targetJoints: string;
  durationSeconds: number;
  repsLabel: string;
  intensity: string;
  cues: string[];
  jointBenefits: string;
  poseType: 'armcircles' | 'legswings' | 'torsotwists';
}

export const DYNAMIC_MOBILITY_EXERCISES: MobilityExerciseItem[] = [
  {
    id: 'mob-arm-circles',
    stepNumber: 'M1',
    name: 'Arm Circles & Shoulder Dislocates',
    subtitle: 'Rotator cuff priming & glenohumeral joint lubrication',
    targetJoints: 'Rotator Cuff · Glenohumeral Joint · Upper Trapezius',
    durationSeconds: 45,
    repsLabel: '15 Fwd Circles + 15 Back Circles',
    intensity: 'Light Intensity',
    cues: [
      'Extend arms out horizontally at shoulder height, palms facing down.',
      'Perform smooth concentric circles, starting small and gradually expanding diameter.',
      'Reverse direction after 15 reps to lubricate subscapularis and infraspinatus.'
    ],
    jointBenefits: 'Stimulates synovial fluid in shoulder joints to protect rotator cuffs during Push-Ups and Ledge Pull-Ups.',
    poseType: 'armcircles',
  },
  {
    id: 'mob-leg-swings',
    stepNumber: 'M2',
    name: 'Leg Swings (Front-to-Back & Lateral)',
    subtitle: 'Acetabulofemoral hip opening & dynamic hamstring elongation',
    targetJoints: 'Hip Acetabulofemoral Joint · Hamstrings · Adductors',
    durationSeconds: 45,
    repsLabel: '10 Front/Back + 10 Lateral / Leg',
    intensity: 'Light Intensity',
    cues: [
      'Support yourself lightly against a wall or doorframe for balance.',
      'Swing one leg smoothly anterior to posterior without hyperextending your lumbar spine.',
      'Turn sideways and swing across your body to dynamically mobilize adductors.'
    ],
    jointBenefits: 'Decompresses the hip socket and increases active range of motion for deep Bulgarian Split Squats.',
    poseType: 'legswings',
  },
  {
    id: 'mob-torso-twists',
    stepNumber: 'M3',
    name: 'Standing Torso Twists & Reach',
    subtitle: 'Thoracic rotational decompression & transverse core priming',
    targetJoints: 'Thoracic Spine · Obliques · Quadratus Lumborum',
    durationSeconds: 45,
    repsLabel: '20 Smooth Alternating Twists',
    intensity: 'Light Intensity',
    cues: [
      'Stand with feet shoulder-width apart, arms relaxed at 90-degree elbows.',
      'Rotate your torso smoothly side to side, pivoting your trailing heel to protect knee joints.',
      'Breathe rhythmically: inhale at center, exhale on rotational extension.'
    ],
    jointBenefits: 'Releases morning stiffness across thoracic vertebrae, preparing ribcage expansion and posture alignment.',
    poseType: 'torsotwists',
  },
];

export function calculateMobilityCompletion(
  completedMobilityIds: string[],
  totalExercises = DYNAMIC_MOBILITY_EXERCISES.length
): {
  completedCount: number;
  totalRequired: number;
  isAllPrimed: boolean;
  completionPercent: number;
} {
  const completedCount = completedMobilityIds.length;
  const isAllPrimed = totalExercises > 0 && completedCount >= totalExercises;
  const completionPercent =
    totalExercises > 0 ? Math.round((completedCount / totalExercises) * 100) : 0;
  return { completedCount, totalRequired: totalExercises, isAllPrimed, completionPercent };
}


export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Sharif',
  email: 'sharif.morning20@gmail.com',
  avatarUrl: '',
  heightCm: 175,
  heightUnit: 'cm',
  currentWeightKg: 66,
  targetWeightKg: 72,
  maxPushUps: 5,
  maxPullUps: 3,
  onboarded: false,
};

export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = Math.round(cm / 2.54);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return { feet, inches };
}

export function feetInchesToCm(feet: number, inches: number): number {
  return Math.round((feet * 12 + inches) * 2.54);
}

export function formatHeight(heightCm: number, unit: 'cm' | 'ft'): string {
  if (unit === 'ft') {
    const { feet, inches } = cmToFeetInches(heightCm);
    return `${feet} ft ${inches} in`;
  }
  return `${Math.round(heightCm)} cm`;
}

export function formatHeightCompact(heightCm: number, unit: 'cm' | 'ft'): string {
  if (unit === 'ft') {
    const { feet, inches } = cmToFeetInches(heightCm);
    return `${feet}'${inches}"`;
  }
  return `${Math.round(heightCm)} cm`;
}

export function formatHeightWithBoth(heightCm: number, unit: 'cm' | 'ft'): string {
  const { feet, inches } = cmToFeetInches(heightCm);
  const ftIn = `${feet} ft ${inches} in`;
  const cmStr = `${Math.round(heightCm)} cm`;
  if (unit === 'ft') {
    return `${ftIn} (${cmStr})`;
  }
  return `${cmStr} (${ftIn})`;
}

export interface AvatarPreset {
  id: string;
  name: string;
  tagline: string;
  symbol: string;
  fromColor: string;
  toColor: string;
  svgDataUri: string;
}

export function generatePresetSvgDataUri(
  color: string,
  symbol: string,
  accent = '#FFFFFF'
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128"><rect width="128" height="128" rx="64" fill="${color}"/><circle cx="64" cy="64" r="54" fill="none" stroke="${accent}" stroke-width="2.5" opacity="0.35"/><text x="64" y="77" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="44" fill="${accent}">${symbol}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const ATHLETIC_AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: 'titan-flame',
    name: 'Titan Flame',
    tagline: 'Hypertrophy Power',
    symbol: 'M',
    fromColor: '#E11D48',
    toColor: '#BE123C',
    svgDataUri: generatePresetSvgDataUri('#E11D48', 'M'),
  },
  {
    id: 'volt-athlete',
    name: 'Volt Athlete',
    tagline: 'High-Power Calisthenics',
    symbol: 'V',
    fromColor: '#0284C7',
    toColor: '#0369A1',
    svgDataUri: generatePresetSvgDataUri('#0284C7', 'V'),
  },
  {
    id: 'iron-will',
    name: 'Iron Monolith',
    tagline: 'Titanium Discipline',
    symbol: 'I',
    fromColor: '#334155',
    toColor: '#0F172A',
    svgDataUri: generatePresetSvgDataUri('#0F172A', 'I'),
  },
  {
    id: 'emerald-flow',
    name: 'Emerald Zen',
    tagline: 'Mobility & Recovery',
    symbol: 'E',
    fromColor: '#059669',
    toColor: '#047857',
    svgDataUri: generatePresetSvgDataUri('#059669', 'E'),
  },
  {
    id: 'gold-spartan',
    name: 'Golden Champion',
    tagline: 'Elite 30-Day Finisher',
    symbol: 'G',
    fromColor: '#D97706',
    toColor: '#B45309',
    svgDataUri: generatePresetSvgDataUri('#D97706', 'G'),
  },
  {
    id: 'cosmic-surge',
    name: 'Cosmic Surge',
    tagline: 'Explosive Drive',
    symbol: 'C',
    fromColor: '#0D9488',
    toColor: '#0F766E',
    svgDataUri: generatePresetSvgDataUri('#0D9488', 'C'),
  },
  {
    id: 'ocean-power',
    name: 'Deep Ocean',
    tagline: 'Calm & Unstoppable',
    symbol: 'O',
    fromColor: '#0284C7',
    toColor: '#1E40AF',
    svgDataUri: generatePresetSvgDataUri('#1E40AF', 'O'),
  },
  {
    id: 'sunrise-morning',
    name: 'Morning 20 Sunrise',
    tagline: 'Early Dawn Calisthenics',
    symbol: 'S',
    fromColor: '#E11D48',
    toColor: '#9F1239',
    svgDataUri: generatePresetSvgDataUri('#E11D48', 'S'),
  },
];

export function calculateDailyProteinTarget(currentWeightKg: number, targetWeightKg: number): {
  gramsPerDay: number;
  postWorkoutGrams: number;
  calorieSurplusKcal: number;
} {
  const referenceWeight = Math.max(currentWeightKg, targetWeightKg);
  const gramsPerDay = Math.round(referenceWeight * 2.0);
  const postWorkoutGrams = Math.round(gramsPerDay * 0.3);
  const weightDelta = targetWeightKg - currentWeightKg;
  const calorieSurplusKcal = weightDelta > 0 ? 350 : weightDelta < 0 ? -300 : 150;
  return { gramsPerDay, postWorkoutGrams, calorieSurplusKcal };
}

export function buildPersonalizedWorkout(profile: Pick<UserProfile, 'maxPushUps' | 'maxPullUps'>): ExerciseItem[] {
  const pushBase = Math.max(1, profile.maxPushUps);
  const pullBase = Math.max(1, profile.maxPullUps);

  const strictPushReps = Math.max(3, Math.round(pushBase * 0.85));
  const kneeDropReps = Math.max(5, pushBase + 3);

  const strictPullReps = Math.max(1, Math.round(pullBase * 0.8));
  const negativePullReps = Math.max(3, 6 - strictPullReps);

  const pikeReps = Math.max(4, Math.round(pushBase * 0.7) + 2);
  const splitSquatReps = Math.max(8, Math.min(15, pushBase + 5));

  return [
    {
      id: 'warmup-mobility',
      stepNumber: '1',
      name: 'Warm-Up: Lunge Twists & Scapular Push-Ups',
      subtitle: '2 mins thoracic rotation, hip flexor opening & scapular protraction',
      category: 'warmup',
      rounds: 1,
      workSeconds: 45,
      restSeconds: 15,
      tempo: 'Controlled Flow',
      prescribedReps: '8 Lunge Twists + 10 Scapular Push-Ups',
      cues: [
        'Step into a deep runner lunge and rotate your torso toward the front knee.',
        'In plank position, keep elbows locked and pinch/spread shoulder blades 10 times.',
        'Breathe deeply through the nose to prime shoulder and hip joint capsule synovial fluid.'
      ],
      equipment: 'Floor space',
      targetMuscles: 'Thoracic Spine · Serratus Anterior · Hip Flexors',
      poseType: 'warmup',
    },
    {
      id: 'pushups-dropset',
      stepNumber: '2',
      name: 'Push-Ups (Drop-Set with 3-1-1 Tempo)',
      subtitle: 'Mechanical tension chest & triceps overload with immediate knee drop-set',
      category: 'circuit',
      rounds: 3,
      workSeconds: 45,
      restSeconds: 15,
      tempo: '3-1-1 Tempo',
      prescribedReps: `${strictPushReps} Strict Reps + ${kneeDropReps} Knee Drop-Set`,
      cues: [
        'Lower your chest over 3 full seconds with elbows tucked at a 45-degree arrow angle.',
        'Pause 1 second at 1 inch above the floor without losing core brace.',
        'Drive up explosively in 1 second; once strict form slows, drop knees immediately for burnout.'
      ],
      equipment: 'Floor / Push-up handles',
      targetMuscles: 'Pectoralis Major · Anterior Deltoid · Triceps',
      poseType: 'pushup',
    },
    {
      id: 'bulgarian-split-squats',
      stepNumber: '3',
      name: 'Bulgarian Split Squats (Bed Edge)',
      subtitle: 'Single-leg quad & glute hypertrophy using your bed frame for rear foot elevation',
      category: 'circuit',
      rounds: 3,
      workSeconds: 45,
      restSeconds: 15,
      tempo: '3-1-1 Tempo',
      prescribedReps: `${splitSquatReps} Reps / Leg`,
      cues: [
        'Hook your rear instep lightly on the mattress edge and step 2.5 feet forward.',
        'Lower your back knee toward the floor for 3 seconds with a slight forward torso lean.',
        'Hold 1 second at deep hip flexion, then drive through your front mid-foot.'
      ],
      equipment: 'Bed edge',
      targetMuscles: 'Quadriceps · Gluteus Maximus · Adductors',
      poseType: 'splitsquat',
    },
    {
      id: 'ledge-pullups',
      stepNumber: '4',
      name: 'Ledge Pull-Ups (Towel Grip + 4s Negatives)',
      subtitle: 'Upper-back width & forearm grip builder with padded overhead ledge + eccentric overload',
      category: 'circuit',
      rounds: 3,
      workSeconds: 45,
      restSeconds: 15,
      tempo: '3-1-1 / 4s Eccentric',
      prescribedReps: `${strictPullReps} Full Pulls + ${negativePullReps} Slow 4s Negatives`,
      cues: [
        'Fold a thick cotton towel over your overhead door/beam ledge to protect fingers and engage forearms.',
        'Depress shoulder blades first, then pull elbows down toward your ribs.',
        'After reaching concentric limit, step up and lower yourself for a strict 4-second count.'
      ],
      equipment: 'Overhead ledge + Folded towel',
      targetMuscles: 'Latissimus Dorsi · Biceps Brachii · Forearm Flexors',
      poseType: 'pullup',
    },
    {
      id: 'bed-pike-pushups',
      stepNumber: '5',
      name: 'Bed Pike Push-Ups',
      subtitle: 'Vertical pressing overload for boulder deltoids and upper clavicular chest',
      category: 'circuit',
      rounds: 3,
      workSeconds: 45,
      restSeconds: 15,
      tempo: '3-1-1 Tempo',
      prescribedReps: `${pikeReps} Controlled Reps`,
      cues: [
        'Place feet on the bed edge or floor in an inverted V-pike with hips stacked high.',
        'Lower the crown of your head *forward* of your hands over 3 seconds (forming a tripod).',
        'Pause 1 second at the bottom, then press back into the inverted V alignment.'
      ],
      equipment: 'Bed edge / Floor',
      targetMuscles: 'Anterior & Lateral Deltoids · Upper Trapezius · Triceps',
      poseType: 'pikepushup',
    },
    {
      id: 'cobra-stretch-cooldown',
      stepNumber: '6',
      name: 'Post-Workout Cobra Stretch & Decompression',
      subtitle: 'Abdominal fascia stretch, lumbar extension & parasympathetic heart-rate recovery',
      category: 'cooldown',
      rounds: 1,
      workSeconds: 45,
      restSeconds: 15,
      tempo: 'Deep Nasal Breathing',
      prescribedReps: '45s Cobra Hold + 4-7-8 Breath',
      cues: [
        'Lie prone, press palms under shoulders, and lift your chest while keeping hips grounded.',
        'Draw shoulders away from your ears and inhale for 4 seconds into the ribcage.',
        'Transition immediately to your High-Protein Breakfast within 45 minutes.'
      ],
      equipment: 'Floor mat',
      targetMuscles: 'Rectus Abdominis · Erector Spinae · Chest Opener',
      poseType: 'cobra',
    },
  ];
}

export function generateInitial30DayCalendar(todayDayNumber = 12): CalendarDay[] {
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const baseDate = new Date(2026, 9, 19); // Oct 19, 2026
  const days: CalendarDay[] = [];

  for (let i = 1; i <= 30; i++) {
    const offsetDays = i - todayDayNumber;
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + offsetDays);
    const monthShort = d.toLocaleString('en-US', { month: 'short' });
    const dayOfMonth = d.getDate();
    const isRecoveryDay = i % 7 === 0;
    // Pre-mark days 8, 9, 10, 11 as completed with logged durations demonstrating progression
    const completed = i >= todayDayNumber - 4 && i < todayDayNumber;
    let durationSeconds: number | undefined = undefined;
    if (completed) {
      const historicalDurations: Record<number, number> = {
        8: 1395, // Day 8: 23m 15s (initial baseline)
        9: 1324, // Day 9: 22m 04s (-1m 11s)
        10: 1252, // Day 10: 20m 52s (-1m 12s)
        11: 1180, // Day 11: 19m 40s (-1m 12s)
      };
      durationSeconds = historicalDurations[i] || 1200;
    }

    days.push({
      dayNumber: i,
      dateLabel: `${monthShort} ${dayOfMonth}`,
      weekdayShort: weekdays[(i - 1) % 7],
      isRecoveryDay,
      completed,
      isToday: i === todayDayNumber,
      durationSeconds,
    });
  }
  return days;
}

export function calculateStreakStats(days: CalendarDay[]): {
  activeStreak: number;
  totalCompleted: number;
  completionRate: number;
  todayCompleted: boolean;
  shieldsUsed: number;
} {
  const todayIdx = days.findIndex((d) => d.isToday);
  const referenceIndex = todayIdx >= 0 ? todayIdx : days.length - 1;
  const todayCompleted = todayIdx >= 0 ? days[todayIdx].completed : false;

  let activeStreak = 0;
  const startIndex = todayCompleted ? referenceIndex : referenceIndex - 1;

  for (let i = startIndex; i >= 0; i--) {
    if (days[i].completed || days[i].isShielded) {
      activeStreak++;
    } else {
      break;
    }
  }

  const totalCompleted = days.filter((d) => d.completed).length;
  const shieldsUsed = days.filter((d) => d.isShielded).length;
  const completionRate = days.length > 0 ? Math.round((totalCompleted / days.length) * 100) : 0;

  return {
    activeStreak,
    totalCompleted,
    completionRate,
    todayCompleted,
    shieldsUsed,
  };
}

export const MAX_STREAK_SHIELDS = 2;

export function toggleDayShield(
  days: CalendarDay[],
  dayNumber: number,
  maxShields = MAX_STREAK_SHIELDS
): {
  days: CalendarDay[];
  shieldsUsed: number;
  success: boolean;
  message: string;
} {
  const currentShields = days.filter((d) => d.isShielded).length;
  const target = days.find((d) => d.dayNumber === dayNumber);

  if (!target) {
    return { days, shieldsUsed: currentShields, success: false, message: 'Day not found in calendar.' };
  }

  if (target.isShielded) {
    const updated = days.map((d) =>
      d.dayNumber === dayNumber ? { ...d, isShielded: false } : d
    );
    return {
      days: updated,
      shieldsUsed: currentShields - 1,
      success: true,
      message: `Streak Shield removed from Day ${dayNumber}. Shield restored.`,
    };
  }

  if (target.completed) {
    return {
      days,
      shieldsUsed: currentShields,
      success: false,
      message: `Day ${dayNumber} is already completed! Streak Shields are for missed days or rest protection.`,
    };
  }

  if (currentShields >= maxShields) {
    return {
      days,
      shieldsUsed: currentShields,
      success: false,
      message: `All ${maxShields} Streak Shields deployed. Remove one from another day to reassign.`,
    };
  }

  const updated = days.map((d) =>
    d.dayNumber === dayNumber ? { ...d, isShielded: true } : d
  );

  return {
    days: updated,
    shieldsUsed: currentShields + 1,
    success: true,
    message: `Streak Shield deployed on Day ${dayNumber}! Your consistency streak is protected.`,
  };
}

export function toggleCalendarDay(days: CalendarDay[], dayNumber: number): CalendarDay[] {
  return days.map((day) =>
    day.dayNumber === dayNumber ? { ...day, completed: !day.completed } : day
  );
}

export function didCompleteCalendarDay(days: CalendarDay[], dayNumber: number): boolean {
  const target = days.find((d) => d.dayNumber === dayNumber);
  return target ? !target.completed : false;
}

export function logDayDuration(
  days: CalendarDay[],
  dayNumber: number,
  durationSeconds: number
): CalendarDay[] {
  const safeDuration = Math.max(0, Math.floor(Number.isFinite(durationSeconds) ? durationSeconds : 0));
  return days.map((day) =>
    day.dayNumber === dayNumber
      ? {
          ...day,
          completed: safeDuration > 0 ? true : day.completed,
          durationSeconds: safeDuration > 0 ? safeDuration : undefined,
        }
      : day
  );
}

export function formatDurationMmSs(seconds?: number): string {
  if (typeof seconds !== 'number' || seconds <= 0 || !Number.isFinite(seconds)) {
    return '--:--';
  }
  const safe = Math.floor(seconds);
  const m = Math.floor(safe / 60);
  const s = Math.floor(safe % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function formatDurationHuman(seconds?: number): string {
  if (typeof seconds !== 'number' || seconds <= 0 || !Number.isFinite(seconds)) {
    return '--';
  }
  const safe = Math.floor(seconds);
  const m = Math.floor(safe / 60);
  const s = Math.floor(safe % 60);
  if (s === 0) return `${m}m`;
  return `${m}m ${String(s).padStart(2, '0')}s`;
}

export interface EfficiencyStats {
  completedWithDurationCount: number;
  averageDurationSeconds: number;
  fastestDurationSeconds: number;
  slowestDurationSeconds: number;
  baselineDurationSeconds: number;
  latestDurationSeconds: number;
  improvementSeconds: number; // positive = faster than baseline
  improvementPercent: number; // positive = percentage time reduction
  paceTrend: 'improving' | 'steady' | 'slower' | 'insufficient_data';
  fastestDayNumber: number | null;
}

export function calculateEfficiencyStats(days: CalendarDay[]): EfficiencyStats {
  const loggedDays = days
    .filter((d) => d.completed && typeof d.durationSeconds === 'number' && d.durationSeconds > 0)
    .sort((a, b) => a.dayNumber - b.dayNumber);

  if (loggedDays.length === 0) {
    return {
      completedWithDurationCount: 0,
      averageDurationSeconds: 0,
      fastestDurationSeconds: 0,
      slowestDurationSeconds: 0,
      baselineDurationSeconds: 0,
      latestDurationSeconds: 0,
      improvementSeconds: 0,
      improvementPercent: 0,
      paceTrend: 'insufficient_data',
      fastestDayNumber: null,
    };
  }

  const totalSecs = loggedDays.reduce((acc, d) => acc + (d.durationSeconds || 0), 0);
  const averageDurationSeconds = Math.round(totalSecs / loggedDays.length);

  let fastest = loggedDays[0];
  let slowest = loggedDays[0];
  for (const d of loggedDays) {
    if ((d.durationSeconds || 0) < (fastest.durationSeconds || Infinity)) fastest = d;
    if ((d.durationSeconds || 0) > (slowest.durationSeconds || 0)) slowest = d;
  }

  const baselineDurationSeconds = loggedDays[0].durationSeconds || 0;
  const latestDurationSeconds = loggedDays[loggedDays.length - 1].durationSeconds || 0;
  const improvementSeconds = baselineDurationSeconds - latestDurationSeconds;
  const improvementPercent =
    baselineDurationSeconds > 0
      ? Math.round(((baselineDurationSeconds - latestDurationSeconds) / baselineDurationSeconds) * 1000) / 10
      : 0;

  let paceTrend: 'improving' | 'steady' | 'slower' | 'insufficient_data' = 'insufficient_data';
  if (loggedDays.length >= 2) {
    if (improvementSeconds > 15) {
      paceTrend = 'improving';
    } else if (improvementSeconds < -15) {
      paceTrend = 'slower';
    } else {
      paceTrend = 'steady';
    }
  }

  return {
    completedWithDurationCount: loggedDays.length,
    averageDurationSeconds,
    fastestDurationSeconds: fastest.durationSeconds || 0,
    slowestDurationSeconds: slowest.durationSeconds || 0,
    baselineDurationSeconds,
    latestDurationSeconds,
    improvementSeconds,
    improvementPercent,
    paceTrend,
    fastestDayNumber: fastest.dayNumber,
  };
}

/**
 * Calculates the 3-1-1 tempo state given elapsed milliseconds in a workout set.
 * Each rep is 5000ms total:
 * - 0..3000ms: Eccentric (Lower 3s)
 * - 3000..4000ms: Pause (Hold 1s)
 * - 4000..5000ms: Concentric (Drive 1s)
 */
export function calculateTempoState(elapsedMs: number): TempoState {
  const safeMs = Math.max(0, elapsedMs);
  const cycleDurationMs = 5000;
  const repNumber = Math.floor(safeMs / cycleDurationMs) + 1;
  const msInCycle = safeMs % cycleDurationMs;
  const cycleProgressPercent = Math.round((msInCycle / cycleDurationMs) * 100);

  if (msInCycle < 3000) {
    const phaseProgressPercent = Math.round((msInCycle / 3000) * 100);
    const phaseSecond = Math.min(3, Math.floor(msInCycle / 1000) + 1);
    return {
      repNumber,
      phase: 'Eccentric (Lower 3s)',
      phaseShort: 'LOWER 3s',
      phaseSecond,
      phaseProgressPercent,
      cycleProgressPercent,
      bodyDepthFactor: msInCycle / 3000,
    };
  } else if (msInCycle < 4000) {
    const msInHold = msInCycle - 3000;
    const phaseProgressPercent = Math.round((msInHold / 1000) * 100);
    return {
      repNumber,
      phase: 'Pause (Hold 1s)',
      phaseShort: 'HOLD 1s',
      phaseSecond: 1,
      phaseProgressPercent,
      cycleProgressPercent,
      bodyDepthFactor: 1,
    };
  } else {
    const msInDrive = msInCycle - 4000;
    const phaseProgressPercent = Math.round((msInDrive / 1000) * 100);
    return {
      repNumber,
      phase: 'Concentric (Drive 1s)',
      phaseShort: 'DRIVE 1s',
      phaseSecond: 1,
      phaseProgressPercent,
      cycleProgressPercent,
      bodyDepthFactor: 1 - msInDrive / 1000,
    };
  }
}

export function computePostWorkoutTime(morningTime24: string, delayMinutes = 45): {
  workoutTime12: string;
  proteinTime24: string;
  proteinTime12: string;
} {
  const parts = morningTime24.split(':');
  const hours = Number.parseInt(parts[0] || '7', 10);
  const minutes = Number.parseInt(parts[1] || '0', 10);

  const safeHours = Number.isNaN(hours) ? 7 : Math.max(0, Math.min(23, hours));
  const safeMinutes = Number.isNaN(minutes) ? 0 : Math.max(0, Math.min(59, minutes));

  const totalStartMinutes = safeHours * 60 + safeMinutes;
  const totalProteinMinutes = (totalStartMinutes + delayMinutes) % (24 * 60);

  const pHours = Math.floor(totalProteinMinutes / 60);
  const pMinutes = totalProteinMinutes % 60;

  const proteinTime24 = `${String(pHours).padStart(2, '0')}:${String(pMinutes).padStart(2, '0')}`;

  return {
    workoutTime12: format24To12(safeHours, safeMinutes),
    proteinTime24,
    proteinTime12: format24To12(pHours, pMinutes),
  };
}

function format24To12(hours: number, minutes: number): string {
  const period = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${h12}:${String(minutes).padStart(2, '0')} ${period}`;
}

/**
 * Formats elapsed seconds into MM:SS string (e.g. 75 -> "01:15")
 */
export function formatElapsedMmSs(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(Number.isFinite(totalSeconds) ? totalSeconds : 0));
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}


export function generateCoachFallbackResponse(
  query: string,
  profile: UserProfile,
  activeStreak: number
): string {
  const q = query.toLowerCase();
  const proteinInfo = calculateDailyProteinTarget(profile.currentWeightKg, profile.targetWeightKg);
  const workout = buildPersonalizedWorkout(profile);

  if (q.includes('sore') || q.includes('modify') || q.includes('pain') || q.includes('tired')) {
    return `Hey ${profile.name}, since you're on a **${activeStreak}-day streak**, listening to joint vs. muscle soreness is key:\n\n1. **Push-Up Modification**: Instead of ${workout[1].prescribedReps} on the floor, raise your hands on the edge of your bed and keep the **3-1-1 tempo** (3s lower, 1s pause, 1s drive). This reduces shoulder load by ~25% while preserving chest hypertrophy tension.\n2. **Ledge Pull-Ups**: Skip the concentric pull today and perform **4 slow 4-second towel-grip negatives** with 20s rest between reps.\n3. **Active Recovery**: Spend an extra 60 seconds on Lunge Twists and the Post-Workout Cobra Stretch.`;
  }

  if (q.includes('breakfast') || q.includes('protein') || q.includes('meal') || q.includes('eat') || q.includes('food')) {
    return `To climb from **${profile.currentWeightKg} kg → ${profile.targetWeightKg} kg**, your daily target is **${proteinInfo.gramsPerDay}g protein** (~${proteinInfo.postWorkoutGrams}g within 45 mins of finishing your Morning 20).\n\n**3 Fast High-Protein Morning Meals:**\n- **The Morning 20 Power Bowl (42g protein):** 3 whole eggs scrambled with spinach + 200g Greek yogurt topped with 2 chopped Medjool dates and 20g almonds.\n- **Savory Paneer/Tofu & Egg Wrap (38g protein):** 2 whole eggs + 100g grilled paneer or firm tofu in a whole-wheat tortilla with coriander chutney.\n- **Zero-Cook Oats & Whey Shake (44g protein):** 60g rolled oats, 1 scoop whey/plant isolate, 250ml milk, 1 banana, and 1 tbsp peanut butter blended post-Cobra stretch.`;
  }

  if (q.includes('pull') || q.includes('ledge') || q.includes('towel') || q.includes('grip')) {
    return `For your **${profile.maxPullUps}-rep Ledge Pull-Up baseline**, the folded towel is essential:\n\n- **Why the Towel Works**: Wrapping a thick folded hand towel over the door frame or overhead beam increases friction and shifts load from the distal fingertips into your **brachioradialis and latissimus dorsi**.\n- **Your Target Today**: Aim for **${workout[3].prescribedReps}**. Even if you only hit ${Math.max(1, profile.maxPullUps - 1)} strict pulls, stepping onto a chair and fighting gravity for a **4-second eccentric negative** recruits the highest-threshold fast-twitch motor units.`;
  }

  if (q.includes('tempo') || q.includes('3-1-1') || q.includes('grow') || q.includes('muscle')) {
    return `Why we use the **3-1-1 Tempo** in a 20-minute bodyweight session:\n\n- **3s Eccentric (Lowering)**: Creates microscopic mechanical tension in muscle fibers without needing heavy barbells.\n- **1s Isometric Pause**: Eliminates the "bounce" (stretch reflex) at the bottom of your Push-Ups and Bulgarian Split Squats.\n- **1s Explosive Drive**: Maximizes motor-unit recruitment.\n\nAt your current baseline (${profile.maxPushUps} push-ups / ${profile.maxPullUps} pull-ups), 9 strict reps at 3-1-1 gives you **45 seconds of pure time-under-tension**—the exact hypertrophy sweet spot!`;
  }

  return `Great question, ${profile.name}! Based on your profile (**${profile.currentWeightKg} kg → ${profile.targetWeightKg} kg**, baseline **${profile.maxPushUps} push-ups / ${profile.maxPullUps} pull-ups**, **${activeStreak}-day streak**):\n\n- **Today's Focus**: Stick to the **45s work / 15s rest** cadence across all 3 rounds.\n- **Progressive Overload**: On Round 3 of Push-Ups (${workout[1].prescribedReps}) and Bulgarian Split Squats (${workout[2].prescribedReps}), push to 1 rep shy of technical failure.\n- **Post-Session Fuel**: Hit **${proteinInfo.postWorkoutGrams}g of protein** within 45 minutes of your Cobra Stretch to lock in myofibrillar protein synthesis.`;
}

export type BottomNavSectionId = 'overview' | 'streak' | 'prep' | 'circuit';

export interface SectionOffsetItem {
  id: BottomNavSectionId;
  top: number;
}

/**
 * Given the current viewport scrollY and the offsetTop of each section,
 * returns the active section ID for the bottom navigation bar scroll-spy.
 */
export function resolveActiveSectionFromScroll(
  scrollY: number,
  sections: SectionOffsetItem[],
  thresholdOffset = 180
): BottomNavSectionId {
  if (!sections.length) return 'overview';
  const triggerLine = scrollY + thresholdOffset;
  let current: BottomNavSectionId = sections[0].id;

  for (const sec of sections) {
    if (triggerLine >= sec.top) {
      current = sec.id;
    }
  }
  return current;
}

/**
 * Returns true strictly when transitioning from an incomplete circuit (< totalExercises)
 * to all exercises completed (=== totalExercises).
 */
export function didJustCompleteFinalExercise(
  previousCompletedIds: string[],
  nextCompletedIds: string[],
  totalExercises: number
): boolean {
  if (totalExercises <= 0) return false;
  return (
    previousCompletedIds.length < totalExercises &&
    nextCompletedIds.length === totalExercises
  );
}

/**
 * Determines whether the Post-Workout section (Cobra Stretch & High-Protein Breakfast)
 * is unlocked. Post-workout comes strictly after all main circuit exercises are completed.
 */
export function isPostWorkoutUnlocked(
  completedExerciseIds: string[],
  requiredExerciseIds: string[]
): {
  unlocked: boolean;
  completedCount: number;
  totalRequired: number;
  remainingCount: number;
} {
  const totalRequired = requiredExerciseIds.length;
  const completedCount = requiredExerciseIds.filter((id) =>
    completedExerciseIds.includes(id)
  ).length;
  const remainingCount = Math.max(0, totalRequired - completedCount);
  return {
    unlocked: totalRequired > 0 && completedCount === totalRequired,
    completedCount,
    totalRequired,
    remainingCount,
  };
}

export interface WeeklyProgressPoint {
  dayNumber: number;
  dayShort: string;
  dateLabel: string;
  completed: boolean;
  isToday: boolean;
  isRecoveryDay: boolean;
  minutesLogged: number;
  durationSeconds?: number;
  formattedDuration: string;
  barValue: number; // 100 when completed, 18 when pending/missed for visible Recharts bar track
  statusLabel: string;
}

export function getLast7DaysCompletionData(days: CalendarDay[]): {
  points: WeeklyProgressPoint[];
  completedInLast7: number;
  weeklyConsistencyPercent: number;
} {
  if (!days.length) {
    return { points: [], completedInLast7: 0, weeklyConsistencyPercent: 0 };
  }
  const todayIdx = days.findIndex((d) => d.isToday);
  const endIdx = todayIdx >= 0 ? todayIdx : Math.min(6, days.length - 1);
  const startIdx = Math.max(0, endIdx - 6);
  const slice = days.slice(startIdx, endIdx + 1);

  const points: WeeklyProgressPoint[] = slice.map((d) => {
    const minutesLogged = d.durationSeconds
      ? Math.round((d.durationSeconds / 60) * 10) / 10
      : d.completed
      ? 20
      : 0;
    const formattedDuration = formatDurationHuman(d.durationSeconds);
    const barValue = d.completed ? 100 : 18;
    const durationLabel = d.durationSeconds
      ? ` (${formatDurationHuman(d.durationSeconds)})`
      : d.completed
      ? ' (20m)'
      : '';
    const statusLabel = d.completed
      ? d.isRecoveryDay
        ? `Recovery Logged${durationLabel}`
        : `Session Completed${durationLabel}`
      : d.isToday
      ? 'Today (Ready for 20m)'
      : d.isRecoveryDay
      ? 'Active Recovery Day'
      : 'Not Logged (0m)';

    return {
      dayNumber: d.dayNumber,
      dayShort: d.weekdayShort,
      dateLabel: d.dateLabel,
      completed: d.completed,
      isToday: d.isToday,
      isRecoveryDay: d.isRecoveryDay,
      minutesLogged,
      durationSeconds: d.durationSeconds,
      formattedDuration,
      barValue,
      statusLabel,
    };
  });

  const completedInLast7 = points.filter((p) => p.completed).length;
  const weeklyConsistencyPercent =
    points.length > 0 ? Math.round((completedInLast7 / points.length) * 100) : 0;

  return {
    points,
    completedInLast7,
    weeklyConsistencyPercent,
  };
}

export function validateBackupPayload(input: unknown): {
  valid: boolean;
  error?: string;
} {
  if (!input || typeof input !== 'object') {
    return { valid: false, error: 'Backup file must be a JSON object.' };
  }
  const obj = input as Record<string, unknown>;
  if (!obj.profile || typeof obj.profile !== 'object') {
    return { valid: false, error: 'Missing user profile in backup JSON.' };
  }
  if (!Array.isArray(obj.calendarDays) || obj.calendarDays.length !== 30) {
    return { valid: false, error: 'Backup JSON must contain a 30-day calendar array.' };
  }
  return { valid: true };
}

export interface MilestoneBadge {
  id: string;
  title: string;
  description: string;
  icon: 'zap' | 'flame' | 'shield' | 'trophy' | 'award' | 'sparkles' | 'target' | 'heart';
  category: 'streak' | 'circuit' | 'mobility' | 'consistency';
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
  progress: number; // 0..100
  progressLabel: string;
  isUnlocked: boolean;
  unlockedRequirement: string;
}

export function calculateMilestoneBadges(
  calendarDays: CalendarDay[],
  completedExerciseIds: string[],
  completedMobilityIds: string[],
  circuitTotalExercises = 5
): MilestoneBadge[] {
  const streakStats = calculateStreakStats(calendarDays);
  const totalCompleted = streakStats.totalCompleted;
  const activeStreak = streakStats.activeStreak;
  const shieldsUsed = calendarDays.filter((d) => d.isShielded).length;
  const hasFinishedFullCircuit = completedExerciseIds.length >= circuitTotalExercises;
  const hasFinishedAllMobility = completedMobilityIds.length >= 3;

  return [
    {
      id: 'first-session',
      title: 'First Ignition',
      description: 'Complete your first 20-minute morning hypertrophy workout.',
      icon: 'zap',
      category: 'consistency',
      tier: 'bronze',
      progress: Math.min(100, Math.round((totalCompleted / 1) * 100)),
      progressLabel: `${Math.min(1, totalCompleted)} / 1 Session`,
      isUnlocked: totalCompleted >= 1,
      unlockedRequirement: '1 Completed Session',
    },
    {
      id: 'streak-3',
      title: '3-Day Momentum',
      description: 'Maintain an unbroken 3-day morning workout streak.',
      icon: 'flame',
      category: 'streak',
      tier: 'bronze',
      progress: Math.min(100, Math.round((activeStreak / 3) * 100)),
      progressLabel: `${Math.min(3, activeStreak)} / 3 Days`,
      isUnlocked: activeStreak >= 3,
      unlockedRequirement: '3-Day Active Streak',
    },
    {
      id: 'streak-7',
      title: '7-Day Iron Morning',
      description: 'Conquer an entire 7-day consistency block with no missed days.',
      icon: 'trophy',
      category: 'streak',
      tier: 'silver',
      progress: Math.min(100, Math.round((activeStreak / 7) * 100)),
      progressLabel: `${Math.min(7, activeStreak)} / 7 Days`,
      isUnlocked: activeStreak >= 7,
      unlockedRequirement: '7-Day Active Streak',
    },
    {
      id: 'tempo-perfectionist',
      title: '3-1-1 Tempo Maestro',
      description: 'Finish all 5 exercises in the 20-minute hypertrophy circuit.',
      icon: 'target',
      category: 'circuit',
      tier: 'silver',
      progress: Math.min(
        100,
        Math.round((completedExerciseIds.length / circuitTotalExercises) * 100)
      ),
      progressLabel: `${completedExerciseIds.length} / ${circuitTotalExercises} Exercises`,
      isUnlocked: hasFinishedFullCircuit,
      unlockedRequirement: '5/5 Circuit Exercises Done',
    },
    {
      id: 'mobility-disciple',
      title: 'Joint Aegis Primed',
      description: 'Complete all 3 dynamic mobility exercises (circles, swings, twists).',
      icon: 'sparkles',
      category: 'mobility',
      tier: 'bronze',
      progress: Math.min(100, Math.round((completedMobilityIds.length / 3) * 100)),
      progressLabel: `${completedMobilityIds.length} / 3 Primed`,
      isUnlocked: hasFinishedAllMobility,
      unlockedRequirement: '3 Mobility Drills Primed',
    },
    {
      id: 'shield-bearer',
      title: 'Streak Guardian',
      description: 'Deploy a Streak Freeze Shield to protect your workout streak.',
      icon: 'shield',
      category: 'streak',
      tier: 'silver',
      progress: shieldsUsed > 0 ? 100 : 0,
      progressLabel: shieldsUsed > 0 ? `${shieldsUsed} Shield Active` : '0 / 1 Shield Deployed',
      isUnlocked: shieldsUsed > 0,
      unlockedRequirement: '1 Streak Shield Deployed',
    },
    {
      id: 'halfway-hero',
      title: '14-Day Titan',
      description: 'Reach 14 completed sessions in the 30-day transformation protocol.',
      icon: 'award',
      category: 'consistency',
      tier: 'gold',
      progress: Math.min(100, Math.round((totalCompleted / 14) * 100)),
      progressLabel: `${Math.min(14, totalCompleted)} / 14 Sessions`,
      isUnlocked: totalCompleted >= 14,
      unlockedRequirement: '14 Completed Sessions',
    },
    {
      id: 'thirty-day-legend',
      title: '30-Day Hypertrophy Legend',
      description: 'Complete 25 or more sessions across the full 30-day calendar.',
      icon: 'trophy',
      category: 'consistency',
      tier: 'diamond',
      progress: Math.min(100, Math.round((totalCompleted / 25) * 100)),
      progressLabel: `${Math.min(25, totalCompleted)} / 25 Sessions`,
      isUnlocked: totalCompleted >= 25,
      unlockedRequirement: '25+ Completed Sessions',
    },
  ];
}

export function generateWorkoutShareText(params: {
  athleteName: string;
  activeStreak: number;
  totalCompleted: number;
  sessionElapsedSeconds: number;
  dateLabel: string;
  proteinGrams: number;
}): string {
  const mmSs = formatElapsedMmSs(params.sessionElapsedSeconds);
  return `Morning 20 Workout Crushed!\n` +
    `• Athlete: ${params.athleteName}\n` +
    `• Active Streak: ${params.activeStreak} Days\n` +
    `• Session Time: ${mmSs}\n` +
    `• Calendar: ${params.totalCompleted}/30 Sessions Logged (${params.dateLabel})\n` +
    `• Refuel Target: ${params.proteinGrams}g Protein\n` +
    `• 3-1-1 Hypertrophy Tempo · No Gear Required\n` +
    `#Morning20 #Hypertrophy #Streak`;
}
