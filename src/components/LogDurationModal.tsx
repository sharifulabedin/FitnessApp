import React, { useState, useEffect } from 'react';
import { X, Clock, Zap, Check, TrendingUp, Plus, Minus } from 'lucide-react';
import {
  CalendarDay,
  formatDurationMmSs,
  formatDurationHuman,
  calculateEfficiencyStats,
} from '../utils/fitnessLogic';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  calendarDays: CalendarDay[];
  initialDayNumber: number;
  currentElapsedSeconds?: number;
  onSaveDuration: (dayNumber: number, durationSeconds: number) => void;
}

const PRESET_DURATIONS = [
  { label: '18m 30s', seconds: 1110 },
  { label: '19m 15s', seconds: 1155 },
  { label: '19m 40s', seconds: 1180 },
  { label: '20m 00s', seconds: 1200 },
  { label: '20m 45s', seconds: 1245 },
  { label: '21m 30s', seconds: 1290 },
  { label: '22m 15s', seconds: 1335 },
];

export const LogDurationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  calendarDays,
  initialDayNumber,
  currentElapsedSeconds = 0,
  onSaveDuration,
}) => {
  const [selectedDayNumber, setSelectedDayNumber] = useState(initialDayNumber);

  const targetDay = calendarDays.find((d) => d.dayNumber === selectedDayNumber);
  const existingDuration = targetDay?.durationSeconds || (currentElapsedSeconds > 0 ? currentElapsedSeconds : 1200);

  const [minutes, setMinutes] = useState(() => Math.floor(existingDuration / 60));
  const [seconds, setSeconds] = useState(() => Math.floor(existingDuration % 60));

  useEffect(() => {
    setSelectedDayNumber(initialDayNumber);
  }, [initialDayNumber]);

  useEffect(() => {
    const day = calendarDays.find((d) => d.dayNumber === selectedDayNumber);
    const secs = day?.durationSeconds || (day?.isToday && currentElapsedSeconds > 0 ? currentElapsedSeconds : 1200);
    setMinutes(Math.floor(secs / 60));
    setSeconds(Math.floor(secs % 60));
  }, [selectedDayNumber, calendarDays, currentElapsedSeconds]);

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

  const totalSeconds = Math.max(0, minutes * 60 + seconds);
  const efficiency = calculateEfficiencyStats(calendarDays);
  const baselineSeconds = efficiency.baselineDurationSeconds || 1395; // Day 8 baseline
  const diffFromBaseline = baselineSeconds - totalSeconds;
  const isFasterThanBaseline = diffFromBaseline > 0;
  const percentChange = baselineSeconds > 0 ? Math.round((Math.abs(diffFromBaseline) / baselineSeconds) * 100) : 0;

  const handleAdjustMinutes = (delta: number) => {
    setMinutes((m) => Math.max(0, Math.min(60, m + delta)));
  };

  const handleAdjustSecondsOnly = (delta: number) => {
    setSeconds((s) => {
      const next = s + delta;
      if (next >= 60) {
        setMinutes((m) => Math.min(60, m + 1));
        return next % 60;
      }
      if (next < 0) {
        if (minutes > 0) {
          setMinutes((m) => m - 1);
          return 60 + next;
        }
        return 0;
      }
      return next;
    });
  };

  const handleAdjustSeconds = (delta: number) => {
    const nextTotal = Math.max(30, Math.min(3600, totalSeconds + delta));
    setMinutes(Math.floor(nextTotal / 60));
    setSeconds(Math.floor(nextTotal % 60));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveDuration(selectedDayNumber, totalSeconds);
    onClose();
  };

  const handleClear = () => {
    onSaveDuration(selectedDayNumber, 0);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="log-duration-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-2xl transition-all bento-card-tactile"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 id="log-duration-title" className="text-base font-bold text-slate-900 dark:text-white">
                Log Session Duration
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track pace &amp; efficiency improvements across 30 days
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="min-h-[44px] min-w-[44px] rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center transition-colors focus-ring-tactile"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          {/* Day Selector */}
          <div>
            <label htmlFor="day-select" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Calendar Day
            </label>
            <select
              id="day-select"
              value={selectedDayNumber}
              onChange={(e) => setSelectedDayNumber(Number(e.target.value))}
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-2xs"
            >
              {calendarDays.map((d) => (
                <option key={d.dayNumber} value={d.dayNumber}>
                  Day {String(d.dayNumber).padStart(2, '0')} · {d.dateLabel} ({d.weekdayShort})
                  {d.isToday ? ' [Today]' : ''}
                  {d.completed ? ' ✓' : ''}
                  {d.durationSeconds ? ` — ${formatDurationMmSs(d.durationSeconds)}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Live Stopwatch Capture (if timer was running) */}
          {currentElapsedSeconds > 0 && (
            <button
              type="button"
              onClick={() => {
                setMinutes(Math.floor(currentElapsedSeconds / 60));
                setSeconds(Math.floor(currentElapsedSeconds % 60));
              }}
              className="w-full min-h-[44px] p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center justify-between hover:bg-rose-100/70 transition-colors shadow-2xs tactile-button focus-ring-tactile"
            >
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-rose-500" />
                <span>Capture Live Session Timer</span>
              </span>
              <span className="font-mono tabular-nums font-bold text-sm">
                {formatDurationMmSs(currentElapsedSeconds)}
              </span>
            </button>
          )}

          {/* Tactile Stepper Dials */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Workout Duration (Tactile Dials)
            </label>
            <div className="flex items-center justify-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 shadow-inner">
              {/* Minutes Dial */}
              <div className="flex flex-col items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAdjustMinutes(1)}
                  aria-label="Increase minutes"
                  className="min-h-[44px] min-w-[48px] rounded-xl tactile-stepper-btn flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold focus-ring-tactile"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <div className="w-20 h-14 flex items-center justify-center text-3xl font-bold font-mono tabular-nums rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white shadow-inner">
                  {String(minutes).padStart(2, '0')}
                </div>
                <button
                  type="button"
                  onClick={() => handleAdjustMinutes(-1)}
                  aria-label="Decrease minutes"
                  className="min-h-[44px] min-w-[48px] rounded-xl tactile-stepper-btn flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold focus-ring-tactile"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 uppercase tracking-wider">
                  Minutes
                </span>
              </div>

              <span className="text-3xl font-bold font-mono text-slate-400 dark:text-slate-500 pb-5">
                :
              </span>

              {/* Seconds Dial */}
              <div className="flex flex-col items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAdjustSecondsOnly(15)}
                  aria-label="Increase seconds by 15"
                  className="min-h-[44px] min-w-[48px] rounded-xl tactile-stepper-btn flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold focus-ring-tactile"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <div className="w-20 h-14 flex items-center justify-center text-3xl font-bold font-mono tabular-nums rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white shadow-inner">
                  {String(seconds).padStart(2, '0')}
                </div>
                <button
                  type="button"
                  onClick={() => handleAdjustSecondsOnly(-15)}
                  aria-label="Decrease seconds by 15"
                  className="min-h-[44px] min-w-[48px] rounded-xl tactile-stepper-btn flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold focus-ring-tactile"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 uppercase tracking-wider">
                  Seconds
                </span>
              </div>
            </div>

            {/* Quick Adjustment Pills */}
            <div className="grid grid-cols-4 gap-2 mt-2.5">
              <button
                type="button"
                onClick={() => handleAdjustSeconds(-60)}
                className="min-h-[44px] py-1.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-xs font-semibold transition-colors tactile-button focus-ring-tactile"
              >
                -1m
              </button>
              <button
                type="button"
                onClick={() => handleAdjustSeconds(-30)}
                className="min-h-[44px] py-1.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-xs font-semibold transition-colors tactile-button focus-ring-tactile"
              >
                -30s
              </button>
              <button
                type="button"
                onClick={() => handleAdjustSeconds(30)}
                className="min-h-[44px] py-1.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-xs font-semibold transition-colors tactile-button focus-ring-tactile"
              >
                +30s
              </button>
              <button
                type="button"
                onClick={() => handleAdjustSeconds(60)}
                className="min-h-[44px] py-1.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-xs font-semibold transition-colors tactile-button focus-ring-tactile"
              >
                +1m
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <span className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              Quick Pace Presets
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_DURATIONS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setMinutes(Math.floor(preset.seconds / 60));
                    setSeconds(Math.floor(preset.seconds % 60));
                  }}
                  className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-colors tactile-button focus-ring-tactile ${
                    totalSeconds === preset.seconds
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Efficiency Insight Callout */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-950 dark:text-emerald-200 flex items-start gap-2.5 shadow-2xs">
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-emerald-900 dark:text-emerald-100">
                Pace Efficiency Analysis
              </div>
              <div className="text-[11px] text-emerald-800 dark:text-emerald-300 mt-0.5 leading-relaxed">
                {isFasterThanBaseline ? (
                  <span>
                    <strong>{formatDurationHuman(diffFromBaseline)} faster</strong> than your Day 8 baseline ({formatDurationMmSs(baselineSeconds)})! That’s an efficiency improvement of <strong>+{percentChange}%</strong>.
                  </span>
                ) : (
                  <span>
                    Baseline comparison: <strong>{formatDurationMmSs(baselineSeconds)}</strong> (Day 8). Aiming under 20m optimizes hypertrophic density.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            {targetDay?.durationSeconds && (
              <button
                type="button"
                onClick={handleClear}
                className="min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap tactile-button focus-ring-tactile"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 min-h-[44px] py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors tactile-button focus-ring-tactile"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-rose-500/20 transition-colors tactile-button focus-ring-tactile"
            >
              <Check className="w-4 h-4" />
              <span>Save Duration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
