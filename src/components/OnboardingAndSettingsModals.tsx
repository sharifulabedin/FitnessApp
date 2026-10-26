import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Upload,
  RotateCcw,
  Check,
  Dumbbell,
  Sliders,
  Camera,
  LogOut,
} from 'lucide-react';
import {
  UserProfile,
  CalendarDay,
  cmToFeetInches,
  feetInchesToCm,
  calculateDailyProteinTarget,
  validateBackupPayload,
  formatHeight,
  formatHeightWithBoth,
  calculateStreakStats,
  formatDurationHuman,
  calculateEfficiencyStats,
} from '../utils/fitnessLogic';
import { SharifAvatarSvg } from './ExerciseBodyPositionSvg';

interface SplashProps {
  onGoogleLogin: (name: string, email: string) => void;
}

export const GoogleLoginSplash: React.FC<SplashProps> = ({ onGoogleLogin }) => {
  const [customName, setCustomName] = useState('Sharif');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleLoginClick = () => {
    setIsAuthenticating(true);
    window.setTimeout(() => {
      const cleanName = customName.trim() || 'Sharif';
      onGoogleLogin(cleanName, `${cleanName.toLowerCase()}@gmail.com`);
    }, 220);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden">
      {/* Subtle Pastel Rose & Amber Ambient Mesh */}
      <div
        className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-rose-500/15 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-amber-500/15 blur-3xl"
        aria-hidden="true"
      />

      {/* Top Brand Header */}
      <header className="relative z-10 flex items-center justify-between max-w-6xl w-full mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center font-display font-bold text-lg">
            20
          </div>
          <span className="font-display font-bold text-lg tracking-tight text-white">
            Morning 20
          </span>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          3-1-1 Hypertrophy · 30-Day Streak System
        </div>
      </header>

      {/* Main Split Card */}
      <main className="relative z-10 max-w-5xl w-full mx-auto my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-5">
          <div className="text-xs font-mono text-rose-400 tracking-wide font-semibold">
            20-MINUTE BEDROOM HYPERTROPHY &amp; AI STREAK TRACKER
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.1] text-balance">
            Build Lean Muscle in 20 Minutes Every Morning.
          </h1>
          <p className="text-slate-300 text-base leading-relaxed max-w-xl">
            Zero gym commute. Personalized drop-set push-ups, bed-edge Bulgarian split squats, and towel-grip ledge pull-ups paced by a live 3-1-1 tempo timer and Gemini AI Coach.
          </p>

          <div className="grid grid-cols-3 gap-4 pt-2 max-w-lg">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5">
              <div className="font-mono tabular-nums text-2xl font-bold text-rose-400">20m</div>
              <div className="text-xs text-slate-400 mt-0.5">3 Rounds + Mobility</div>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5">
              <div className="font-mono tabular-nums text-2xl font-bold text-amber-400">3-1-1</div>
              <div className="text-xs text-slate-400 mt-0.5">Live Tempo Audio</div>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5">
              <div className="font-mono tabular-nums text-2xl font-bold text-emerald-400">30d</div>
              <div className="text-xs text-slate-400 mt-0.5">Streak + Recovery</div>
            </div>
          </div>
        </div>

        {/* Right Auth Card */}
        <div className="lg:col-span-5 bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 bento-card-tactile">
          <div className="flex items-center gap-3.5 pb-5 border-b border-slate-800">
            <SharifAvatarSvg name={customName || 'Sharif'} className="w-12 h-12" />
            <div>
              <div className="text-base font-bold text-white">Welcome, Athlete</div>
              <div className="text-xs text-slate-400">Sign in to sync your 30-day streak</div>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor="athlete-name-input" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Athlete Name
              </label>
              <input
                id="athlete-name-input"
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Sharif"
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition-colors"
              />
            </div>

            <button
              type="button"
              disabled={isAuthenticating}
              onClick={handleLoginClick}
              className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-950 text-sm font-semibold flex items-center justify-center gap-2.5 transition-colors tactile-button cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isAuthenticating ? 'Authenticating…' : 'Continue with Google'}</span>
            </button>

            <div className="text-[11px] text-slate-400 text-center leading-relaxed">
              Calibrated for 66 kg → 72 kg lean mass progression with 3-1-1 eccentric control.
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center text-xs text-slate-400 font-mono py-4">
        Morning 20 · Designed for Home Hypertrophy with Zero Gym Equipment
      </footer>
    </div>
  );
};

interface OnboardingProps {
  isOpen: boolean;
  initialProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onClose?: () => void;
}

export const BaselineOnboardingModal: React.FC<OnboardingProps> = ({
  isOpen,
  initialProfile,
  onSaveProfile,
  onClose,
}) => {
  const [unit, setUnit] = useState<'cm' | 'ft'>(initialProfile.heightUnit || 'cm');
  const [heightCm, setHeightCm] = useState(String(initialProfile.heightCm || 175));
  const initialFtIn = cmToFeetInches(initialProfile.heightCm || 175);
  const [feet, setFeet] = useState(String(initialFtIn.feet));
  const [inches, setInches] = useState(String(initialFtIn.inches));

  const [currentWeightKg, setCurrentWeightKg] = useState(String(initialProfile.currentWeightKg || 66));
  const [targetWeightKg, setTargetWeightKg] = useState(String(initialProfile.targetWeightKg || 72));
  const [maxPushUps, setMaxPushUps] = useState(String(initialProfile.maxPushUps || 5));
  const [maxPullUps, setMaxPullUps] = useState(String(initialProfile.maxPullUps || 3));
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleUnitSwitch = (nextUnit: 'cm' | 'ft') => {
    if (nextUnit === unit) return;
    if (nextUnit === 'ft') {
      const parsedCm = Number(heightCm) || 175;
      const converted = cmToFeetInches(parsedCm);
      setFeet(String(converted.feet));
      setInches(String(converted.inches));
    } else {
      const convertedCm = feetInchesToCm(Number(feet) || 5, Number(inches) || 9);
      setHeightCm(String(convertedCm));
    }
    setUnit(nextUnit);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalHeightCm =
      unit === 'cm'
        ? Number(heightCm)
        : feetInchesToCm(Number(feet), Number(inches));
    const curW = Number(currentWeightKg);
    const tarW = Number(targetWeightKg);
    const pushB = Number(maxPushUps);
    const pullB = Number(maxPullUps);

    if (!finalHeightCm || finalHeightCm < 100 || finalHeightCm > 250) {
      setErrorMsg('Please enter a valid height between 100 cm and 250 cm.');
      return;
    }
    if (!curW || curW < 30 || curW > 250 || !tarW || tarW < 30 || tarW > 250) {
      setErrorMsg('Please enter valid current and target weights between 30 kg and 250 kg.');
      return;
    }
    if (Number.isNaN(pushB) || pushB < 1 || pushB > 150 || Number.isNaN(pullB) || pullB < 0 || pullB > 60) {
      setErrorMsg('Please enter valid baseline reps (Push-ups: 1–150, Ledge Pull-ups: 0–60).');
      return;
    }

    setErrorMsg(null);
    onSaveProfile({
      ...initialProfile,
      heightCm: Math.round(finalHeightCm),
      heightUnit: unit,
      currentWeightKg: curW,
      targetWeightKg: tarW,
      maxPushUps: Math.round(pushB),
      maxPullUps: Math.round(pullB),
      onboarded: true,
    });
  };

  const previewProtein = calculateDailyProteinTarget(
    Number(currentWeightKg) || 66,
    Number(targetWeightKg) || 72
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-wizard-title"
    >
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 my-auto bento-card-tactile">
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h2 id="onboarding-wizard-title" className="text-xl font-bold text-slate-900 dark:text-white">
                Height, Weight &amp; Baseline Calibration
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Personalizes your 20-minute 3-1-1 hypertrophy rep targets &amp; protein goals
              </p>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close baseline calibration modal"
              className="min-h-[44px] min-w-[44px] rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors focus-ring-tactile"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Height Section with cm / ft toggle */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="height-cm-input" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Current Height
              </label>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200/60 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => handleUnitSwitch('cm')}
                  className={`min-h-[32px] px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                    unit === 'cm'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  cm
                </button>
                <button
                  type="button"
                  onClick={() => handleUnitSwitch('ft')}
                  className={`min-h-[32px] px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                    unit === 'ft'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  ft / in
                </button>
              </div>
            </div>

            {unit === 'cm' ? (
              <input
                id="height-cm-input"
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white dark:focus:bg-slate-900"
                placeholder="175"
              />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="height-ft-input" className="sr-only">Feet</label>
                  <input
                    id="height-ft-input"
                    type="number"
                    value={feet}
                    onChange={(e) => setFeet(e.target.value)}
                    placeholder="5 ft"
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label htmlFor="height-in-input" className="sr-only">Inches</label>
                  <input
                    id="height-in-input"
                    type="number"
                    value={inches}
                    onChange={(e) => setInches(e.target.value)}
                    placeholder="9 in"
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Current & Target Weight */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="current-weight-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Current Weight (kg)
              </label>
              <input
                id="current-weight-input"
                type="number"
                step="0.5"
                value={currentWeightKg}
                onChange={(e) => setCurrentWeightKg(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white dark:focus:bg-slate-900"
              />
            </div>
            <div>
              <label htmlFor="target-weight-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Weight (kg)
              </label>
              <input
                id="target-weight-input"
                type="number"
                step="0.5"
                value={targetWeightKg}
                onChange={(e) => setTargetWeightKg(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white dark:focus:bg-slate-900"
              />
            </div>
          </div>

          {/* Max Push-Ups & Ledge Pull-Ups Baselines */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="max-pushups-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Max Push-Ups Baseline (Default: 5)
              </label>
              <input
                id="max-pushups-input"
                type="number"
                value={maxPushUps}
                onChange={(e) => setMaxPushUps(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white dark:focus:bg-slate-900"
              />
            </div>
            <div>
              <label htmlFor="max-pullups-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Ledge Pull-Ups Baseline (Default: 3)
              </label>
              <input
                id="max-pullups-input"
                type="number"
                value={maxPullUps}
                onChange={(e) => setMaxPullUps(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white dark:focus:bg-slate-900"
              />
            </div>
          </div>

          {/* Calculated Prescription Summary */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex flex-wrap items-center justify-between gap-2">
            <span>
              Daily Protein Goal: <strong className="font-mono text-slate-900 dark:text-white">{previewProtein.gramsPerDay}g/day</strong>
            </span>
            <span>·</span>
            <span>
              Post-Workout Meal: <strong className="font-mono text-rose-600 dark:text-rose-400">{previewProtein.postWorkoutGrams}g within 45m</strong>
            </span>
          </div>

          <button
            type="submit"
            className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors tactile-button focus-ring-tactile"
          >
            <Check className="w-4 h-4" />
            <span>Save Baselines &amp; Build My 20-Min Routine</span>
          </button>
        </form>
      </div>
    </div>
  );
};

interface SettingsBackupProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  calendarDays: CalendarDay[];
  completedExercises: string[];
  prepChecklist: Record<string, boolean>;
  onOpenRecalibrate: () => void;
  onOpenChangeAvatar?: () => void;
  onUpdateHeightUnit?: (unit: 'cm' | 'ft') => void;
  onImportState: (payload: {
    profile: UserProfile;
    calendarDays: CalendarDay[];
    completedExercises?: string[];
    prepChecklist?: Record<string, boolean>;
  }) => void;
  onResetAllData: () => void;
  onLogout?: () => void;
}

export const SettingsBackupModal: React.FC<SettingsBackupProps> = ({
  isOpen,
  onClose,
  profile,
  calendarDays,
  completedExercises,
  prepChecklist,
  onOpenRecalibrate,
  onOpenChangeAvatar,
  onUpdateHeightUnit,
  onImportState,
  onResetAllData,
  onLogout,
}) => {
  const [importJsonText, setImportJsonText] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [confirmReset, setConfirmReset] = useState(false);
  const [justExported, setJustExported] = useState(false);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const streakStats = calculateStreakStats(calendarDays);
  const efficiency = calculateEfficiencyStats(calendarDays);

  const durationLogs = calendarDays
    .filter((d) => (typeof d.durationSeconds === 'number' && d.durationSeconds > 0) || d.completed)
    .map((d) => ({
      dayNumber: d.dayNumber,
      dateLabel: d.dateLabel,
      weekday: d.weekdayShort,
      completed: d.completed,
      isRecoveryDay: d.isRecoveryDay,
      isShielded: !!d.isShielded,
      durationSeconds: d.durationSeconds ?? (d.completed ? 1200 : 0),
      formattedDuration: formatDurationHuman(d.durationSeconds ?? (d.completed ? 1200 : 0)),
    }));

  const handleExportWorkoutData = () => {
    const exportPayload = {
      appName: 'Morning 20',
      version: '2.0',
      exportedAt: new Date().toISOString(),
      exportType: 'morning20_workout_data_backup',
      summary: {
        athlete: profile.name,
        activeStreakDays: streakStats.activeStreak,
        totalSessionsCompleted: streakStats.totalCompleted,
        completionRatePercent: streakStats.completionRate,
        completedExercisesCount: completedExercises.length,
        durationLogsCount: durationLogs.length,
        averageDurationSeconds: efficiency.averageDurationSeconds,
        averageDurationFormatted: formatDurationHuman(efficiency.averageDurationSeconds),
      },
      completedExercises,
      streak: {
        activeStreak: streakStats.activeStreak,
        totalCompleted: streakStats.totalCompleted,
        completionRate: streakStats.completionRate,
        todayCompleted: streakStats.todayCompleted,
        shieldsUsed: streakStats.shieldsUsed,
      },
      durationLogs,
      profile,
      calendarDays,
      prepChecklist,
    };

    const jsonString = JSON.stringify(exportPayload, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeName = profile.name.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-') || 'athlete';
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `morning20-workout-data-${safeName}-${dateStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setJustExported(true);
    window.setTimeout(() => setJustExported(false), 2500);
    setFeedback({
      type: 'success',
      text: `Exported workout data (${completedExercises.length} completed exercises, ${streakStats.activeStreak}-day streak, ${durationLogs.length} duration logs) as JSON backup.`,
    });
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(importJsonText);
      const validation = validateBackupPayload(parsed);
      if (!validation.valid) {
        setFeedback({ type: 'error', text: validation.error || 'Invalid backup format.' });
        return;
      }
      onImportState(parsed);
      setFeedback({ type: 'success', text: 'Backup imported and restored successfully!' });
      setImportJsonText('');
    } catch {
      setFeedback({ type: 'error', text: 'Failed to parse JSON. Please check syntax.' });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || ''));
        const validation = validateBackupPayload(parsed);
        if (!validation.valid) {
          setFeedback({ type: 'error', text: validation.error || 'Invalid backup file.' });
          return;
        }
        onImportState(parsed);
        setFeedback({ type: 'success', text: 'Backup file restored successfully!' });
      } catch {
        setFeedback({ type: 'error', text: 'Invalid JSON file uploaded.' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-backup-title"
    >
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 my-auto space-y-5 bento-card-tactile">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 id="settings-backup-title" className="text-xl font-bold text-slate-900 dark:text-white">
              Settings, JSON Backup &amp; Reset
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage your local storage persistence, export/import backups, or recalibrate baselines
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings modal"
            className="min-h-[44px] min-w-[44px] rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors focus-ring-tactile"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {feedback && (
          <div
            className={`p-3 rounded-xl text-xs font-medium border ${
              feedback.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300'
            }`}
          >
            {feedback.text}
          </div>
        )}

        {/* Profile Picture & Display */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <SharifAvatarSvg
              name={profile.name}
              avatarUrl={profile.avatarUrl}
              className="w-12 h-12"
              onEdit={() => {
                onClose();
                onOpenChangeAvatar?.();
              }}
            />
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">{profile.name}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                {profile.avatarUrl ? 'Custom Photo Active' : 'Default Monogram SVG'} · {profile.email}
              </div>
            </div>
          </div>
          {onOpenChangeAvatar && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenChangeAvatar();
              }}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 text-xs font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors tactile-button focus-ring-tactile"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Change Photo</span>
            </button>
          )}
        </div>

        {/* Height Display Format (cm vs ft/in) */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">Height Display Unit</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Current display: <strong className="text-slate-800 dark:text-slate-200 font-mono">{formatHeightWithBoth(profile.heightCm, profile.heightUnit)}</strong>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
            <button
              type="button"
              onClick={() => onUpdateHeightUnit?.('cm')}
              className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors tactile-button ${
                profile.heightUnit === 'cm'
                  ? 'bg-rose-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Centimeters (cm)
            </button>
            <button
              type="button"
              onClick={() => onUpdateHeightUnit?.('ft')}
              className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors tactile-button ${
                profile.heightUnit === 'ft'
                  ? 'bg-rose-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Feet &amp; Inches (ft / in)
            </button>
          </div>
        </div>

        {/* Recalibrate Baselines */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">
              Height, Weight &amp; Rep Baselines
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              {formatHeight(profile.heightCm, profile.heightUnit)} · {profile.currentWeightKg}kg → {profile.targetWeightKg}kg · {profile.maxPushUps} Push / {profile.maxPullUps} Pull
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenRecalibrate();
            }}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 text-xs font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 whitespace-nowrap shrink-0 tactile-button focus-ring-tactile"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Edit Baselines</span>
          </button>
        </div>

        {/* Export Workout Data & Local Backup */}
        <div className="space-y-3.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                Workout Data &amp; Local Backup
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Generate a JSON backup of your completed exercises, active streak, and duration logs.
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1 sm:pt-0">
              <button
                type="button"
                onClick={handleExportWorkoutData}
                aria-label="Export workout data as JSON backup"
                className="min-h-[40px] px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 tactile-button focus-ring-tactile cursor-pointer"
              >
                {justExported ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Workout Data Exported</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Workout Data</span>
                  </>
                )}
              </button>
              <label className="min-h-[40px] px-3.5 py-2 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 tactile-button focus-ring-tactile border border-slate-300 dark:border-slate-600">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload JSON</span>
                <input
                  type="file"
                  accept="application/json"
                  onChange={handleFileUpload}
                  className="sr-only"
                />
              </label>
            </div>
          </div>

          {/* Quick Metrics of Export Payload */}
          <div className="grid grid-cols-3 gap-2.5 pt-0.5">
            <div className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-700/80 rounded-xl p-2.5">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Completed Exercises</div>
              <div className="font-mono tabular-nums text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                {completedExercises.length} logged
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-700/80 rounded-xl p-2.5">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Active Streak</div>
              <div className="font-mono tabular-nums text-sm font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                {streakStats.activeStreak} {streakStats.activeStreak === 1 ? 'day' : 'days'}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-700/80 rounded-xl p-2.5">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Duration Logs</div>
              <div className="font-mono tabular-nums text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {durationLogs.length} sessions
              </div>
            </div>
          </div>

          <form onSubmit={handleImportSubmit} className="space-y-2 pt-2 border-t border-slate-200/80 dark:border-slate-700/80">
            <label htmlFor="import-json-textarea" className="block text-xs text-slate-500 dark:text-slate-400">
              Or paste exported JSON workout backup payload below to restore:
            </label>
            <textarea
              id="import-json-textarea"
              rows={3}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder='{"profile": {...}, "calendarDays": [...], "completedExercises": [...]}'
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            {importJsonText.trim() && (
              <button
                type="submit"
                className="min-h-[40px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold tactile-button focus-ring-tactile cursor-pointer"
              >
                Restore from Pasted JSON
              </button>
            )}
          </form>
        </div>

        {/* Account & Session */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">Active Session</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Signed in as {profile.name} ({profile.email})
            </div>
          </div>
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 border border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-900/60 transition-colors tactile-button focus-ring-tactile cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          )}
        </div>

        {/* Reset Data */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-rose-600 dark:text-rose-400">Reset All App Data</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Clears localStorage streak history, baselines, and returns to Google login splash
            </div>
          </div>
          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-300 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 border border-rose-200/60 dark:border-rose-900/80 tactile-button focus-ring-tactile"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onResetAllData}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold whitespace-nowrap shrink-0 tactile-button focus-ring-tactile"
              >
                Confirm Reset
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium tactile-button focus-ring-tactile"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
