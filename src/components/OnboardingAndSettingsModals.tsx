import React, { useState } from 'react';
import {
  X,
  Download,
  Upload,
  RotateCcw,
  Check,
  Dumbbell,
  Sliders,
} from 'lucide-react';
import {
  UserProfile,
  CalendarDay,
  cmToFeetInches,
  feetInchesToCm,
  calculateDailyProteinTarget,
  validateBackupPayload,
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
          <div className="text-xs font-mono text-rose-400 tracking-wide">
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
        <div className="lg:col-span-5 bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center gap-3.5 pb-5 border-b border-slate-800">
            <SharifAvatarSvg name={customName || 'Sharif'} className="w-12 h-12" />
            <div>
              <div className="text-sm font-semibold text-white">Athlete Account Session</div>
              <div className="text-xs text-slate-400">
                Syncs 30-day streak &amp; hypertrophy baselines locally
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor="athlete-name-input" className="block text-xs font-medium text-slate-300 mb-1.5">
                Athlete Display Name
              </label>
              <input
                id="athlete-name-input"
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="Sharif"
              />
            </div>

            <button
              type="button"
              onClick={handleLoginClick}
              disabled={isAuthenticating}
              className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-semibold text-sm flex items-center justify-center gap-3 shadow-lg transition-colors whitespace-nowrap shrink-0"
            >
              {/* Google G SVG */}
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.2 8.9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.6l3.7 2.9c2.2-2 3.7-5 3.7-8.7z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.3 14.8c-.2-.8-.4-1.6-.4-2.5s.2-1.7.4-2.5L1.6 7C.6 9 0 11.2 0 13.5s.6 4.5 1.6 6.5l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5l-3.7 2.9C3.5 21.4 7.4 24 12 24z"
                />
              </svg>
              <span>
                {isAuthenticating ? 'Signing in as Sharif...' : 'Sign in with Google'}
              </span>
            </button>

            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
              Simulates Google Auth for <strong>{customName || 'Sharif'}</strong> and launches your Height, Weight &amp; Push-Up/Pull-Up Baseline Wizard.
            </p>
          </div>
        </div>
      </main>

      <footer className="relative z-10 max-w-6xl w-full mx-auto text-xs text-slate-500 flex items-center justify-between">
        <span>Morning 20 Calisthenics Hypertrophy</span>
        <span>Local-First Session Persistence</span>
      </footer>
    </div>
  );
};

interface OnboardingProps {
  isOpen: boolean;
  initialProfile: UserProfile;
  onSaveProfile: (updated: UserProfile) => void;
  onClose?: () => void;
}

export const BaselineOnboardingModal: React.FC<OnboardingProps> = ({
  isOpen,
  initialProfile,
  onSaveProfile,
  onClose,
}) => {
  const [unit, setUnit] = useState<'cm' | 'ft'>(initialProfile.heightUnit || 'cm');
  const [heightCm, setHeightCm] = useState<string>(String(initialProfile.heightCm || 175));
  const initialFtIn = cmToFeetInches(initialProfile.heightCm || 175);
  const [feet, setFeet] = useState<string>(String(initialFtIn.feet));
  const [inches, setInches] = useState<string>(String(initialFtIn.inches));

  const [currentWeightKg, setCurrentWeightKg] = useState<string>(
    String(initialProfile.currentWeightKg || 66)
  );
  const [targetWeightKg, setTargetWeightKg] = useState<string>(
    String(initialProfile.targetWeightKg || 72)
  );
  const [maxPushUps, setMaxPushUps] = useState<string>(
    String(initialProfile.maxPushUps ?? 5)
  );
  const [maxPullUps, setMaxPullUps] = useState<string>(
    String(initialProfile.maxPullUps ?? 3)
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-wizard-title"
    >
      <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xl my-auto">
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h2 id="onboarding-wizard-title" className="text-xl font-bold text-slate-900">
                Height, Weight &amp; Baseline Calibration
              </h2>
              <p className="text-xs text-slate-500">
                Personalizes your 20-minute 3-1-1 hypertrophy rep targets &amp; protein goals
              </p>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close baseline calibration modal"
              className="min-h-[44px] min-w-[44px] rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Height Section with cm / ft toggle */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="height-cm-input" className="text-xs font-semibold text-slate-700">
                Current Height
              </label>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => handleUnitSwitch('cm')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                    unit === 'cm' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  cm
                </button>
                <button
                  type="button"
                  onClick={() => handleUnitSwitch('ft')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                    unit === 'ft' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
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
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
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
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono text-sm text-slate-900"
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
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono text-sm text-slate-900"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Current & Target Weight */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="current-weight-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Current Weight (kg)
              </label>
              <input
                id="current-weight-input"
                type="number"
                step="0.5"
                value={currentWeightKg}
                onChange={(e) => setCurrentWeightKg(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
              />
            </div>
            <div>
              <label htmlFor="target-weight-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Weight (kg)
              </label>
              <input
                id="target-weight-input"
                type="number"
                step="0.5"
                value={targetWeightKg}
                onChange={(e) => setTargetWeightKg(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Max Push-Ups & Ledge Pull-Ups Baselines */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="max-pushups-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Max Push-Ups Baseline (Default: 5)
              </label>
              <input
                id="max-pushups-input"
                type="number"
                value={maxPushUps}
                onChange={(e) => setMaxPushUps(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
              />
            </div>
            <div>
              <label htmlFor="max-pullups-input" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Ledge Pull-Ups Baseline (Default: 3)
              </label>
              <input
                id="max-pullups-input"
                type="number"
                value={maxPullUps}
                onChange={(e) => setMaxPullUps(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Calculated Prescription Summary */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2">
            <span>
              Daily Protein Goal: <strong className="font-mono text-slate-900">{previewProtein.gramsPerDay}g/day</strong>
            </span>
            <span>·</span>
            <span>
              Post-Workout Meal: <strong className="font-mono text-rose-600">{previewProtein.postWorkoutGrams}g within 45m</strong>
            </span>
          </div>

          <button
            type="submit"
            className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
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
  onImportState: (payload: {
    profile: UserProfile;
    calendarDays: CalendarDay[];
    completedExercises?: string[];
    prepChecklist?: Record<string, boolean>;
  }) => void;
  onResetAllData: () => void;
}

export const SettingsBackupModal: React.FC<SettingsBackupProps> = ({
  isOpen,
  onClose,
  profile,
  calendarDays,
  completedExercises,
  prepChecklist,
  onOpenRecalibrate,
  onImportState,
  onResetAllData,
}) => {
  const [importJsonText, setImportJsonText] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isOpen) return null;

  const backupObject = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    profile,
    calendarDays,
    completedExercises,
    prepChecklist,
  };

  const handleExportDownload = () => {
    const jsonString = JSON.stringify(backupObject, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `morning20-backup-${profile.name.toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setFeedback({ type: 'success', text: 'Exported JSON backup file successfully.' });
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
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-backup-title"
    >
      <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xl my-auto space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 id="settings-backup-title" className="text-xl font-bold text-slate-900">
              Settings, JSON Backup &amp; Reset
            </h2>
            <p className="text-xs text-slate-500">
              Manage your local storage persistence, export/import backups, or recalibrate baselines
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings modal"
            className="min-h-[44px] min-w-[44px] rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {feedback && (
          <div
            className={`p-3 rounded-xl text-xs font-medium border ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}
          >
            {feedback.text}
          </div>
        )}

        {/* Recalibrate Baselines */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-slate-900">
              Height, Weight &amp; Rep Baselines
            </div>
            <div className="text-xs text-slate-500 font-mono mt-0.5">
              {profile.heightCm}cm · {profile.currentWeightKg}kg → {profile.targetWeightKg}kg · {profile.maxPushUps} Push / {profile.maxPullUps} Pull
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenRecalibrate();
            }}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-800 flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Edit Baselines</span>
          </button>
        </div>

        {/* Export / Import JSON Backup */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-semibold text-slate-900">
              Export / Import JSON Backup
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportDownload}
                className="min-h-[40px] px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON Backup</span>
              </button>
              <label className="min-h-[40px] px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload JSON File</span>
                <input
                  type="file"
                  accept="application/json"
                  onChange={handleFileUpload}
                  className="sr-only"
                />
              </label>
            </div>
          </div>

          <form onSubmit={handleImportSubmit} className="space-y-2">
            <label htmlFor="import-json-textarea" className="block text-xs text-slate-500">
              Or paste exported JSON backup payload below to restore:
            </label>
            <textarea
              id="import-json-textarea"
              rows={3}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder='{"profile": {...}, "calendarDays": [...]}'
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            {importJsonText.trim() && (
              <button
                type="submit"
                className="min-h-[40px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
              >
                Restore from Pasted JSON
              </button>
            )}
          </form>
        </div>

        {/* Reset Data */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-rose-600">Reset All App Data</div>
            <div className="text-xs text-slate-500">
              Clears localStorage streak history, baselines, and returns to Google login splash
            </div>
          </div>
          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onResetAllData}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold whitespace-nowrap shrink-0"
              >
                Confirm Reset
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium"
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
