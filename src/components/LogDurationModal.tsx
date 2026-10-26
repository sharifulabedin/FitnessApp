import React, { useState, useEffect } from 'react';
import { Clock, Plus, Minus, Check, X, Zap, TrendingUp } from 'lucide-react';
import {
  CalendarDay,
  formatDurationMmSs,
  formatDurationHuman,
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
  { label: '15m 00s', seconds: 900 },
  { label: '18m 30s', seconds: 1110 },
  { label: '20m 00s', seconds: 1200 },
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
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(initialDayNumber);
  const [minutes, setMinutes] = useState<number>(20);
  const [seconds, setSeconds] = useState<number>(0);

  const targetDay = calendarDays.find((d) => d.dayNumber === selectedDayNumber);

  useEffect(() => {
    setSelectedDayNumber(initialDayNumber);
  }, [initialDayNumber]);

  useEffect(() => {
    if (targetDay && targetDay.durationSeconds) {
      setMinutes(Math.floor(targetDay.durationSeconds / 60));
      setSeconds(targetDay.durationSeconds % 60);
    } else if (currentElapsedSeconds > 0) {
      setMinutes(Math.floor(currentElapsedSeconds / 60));
      setSeconds(currentElapsedSeconds % 60);
    } else {
      setMinutes(19);
      setSeconds(30);
    }
  }, [selectedDayNumber, targetDay, currentElapsedSeconds]);

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

  const totalSeconds = minutes * 60 + seconds;

  const handleAdjustMinutes = (delta: number) => {
    setMinutes((prev) => Math.max(1, Math.min(60, prev + delta)));
  };

  const handleAdjustSecondsOnly = (delta: number) => {
    setSeconds((prev) => {
      const next = prev + delta;
      if (next >= 60) return 0;
      if (next < 0) return 45;
      return next;
    });
  };

  const handleAdjustSeconds = (deltaSeconds: number) => {
    const current = minutes * 60 + seconds;
    const next = Math.max(60, Math.min(3600, current + deltaSeconds));
    setMinutes(Math.floor(next / 60));
    setSeconds(next % 60);
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

  // Day 8 baseline pace for efficiency comparison
  const baselineSeconds = calendarDays.find((d) => d.dayNumber === 8)?.durationSeconds || 1230;
  const diffFromBaseline = baselineSeconds - totalSeconds;
  const isFasterThanBaseline = diffFromBaseline > 0;
  const percentChange = Math.round((Math.abs(diffFromBaseline) / baselineSeconds) * 100);

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="log-duration-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 flex items-center justify-center border border-emerald-300 dark:border-emerald-800">
              <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 id="log-duration-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
                Log Workout Duration
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Track and calibrate your 20-min session pace
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="min-h-[44px] min-w-[44px] rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
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
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              {calendarDays.map((d) => (
                <option key={d.dayNumber} value={d.dayNumber}>
                  Day {d.dayNumber} · {d.dateLabel} ({d.weekdayShort})
                  {d.isToday ? ' [Today]' : ''}
                  {d.completed ? ' [Done]' : ''}
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
              className="w-full min-h-[44px] p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center justify-between hover:bg-rose-100/70 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-rose-500" />
                <span>Capture Live Session Timer</span>
              </span>
              <span className="tabular-nums font-bold text-sm">
                {formatDurationMmSs(currentElapsedSeconds)}
              </span>
            </button>
          )}

          {/* Stepper Dials */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Workout Duration
            </label>
            <div className="flex items-center justify-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700">
              {/* Minutes Dial */}
              <div className="flex flex-col items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAdjustMinutes(1)}
                  aria-label="Increase minutes"
                  className="min-h-[44px] min-w-[48px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <div className="w-20 h-14 flex items-center justify-center text-3xl font-bold tabular-nums rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                  {minutes}
                </div>
                <button
                  type="button"
                  onClick={() => handleAdjustMinutes(-1)}
                  aria-label="Decrease minutes"
                  className="min-h-[44px] min-w-[48px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
                  Minutes
                </span>
              </div>

              <span className="text-3xl font-bold text-slate-400 dark:text-slate-500 pb-5">
                :
              </span>

              {/* Seconds Dial */}
              <div className="flex flex-col items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAdjustSecondsOnly(15)}
                  aria-label="Increase seconds by 15"
                  className="min-h-[44px] min-w-[48px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <div className="w-20 h-14 flex items-center justify-center text-3xl font-bold tabular-nums rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                  {String(seconds).padStart(2, '0')}
                </div>
                <button
                  type="button"
                  onClick={() => handleAdjustSecondsOnly(-15)}
                  aria-label="Decrease seconds by 15"
                  className="min-h-[44px] min-w-[48px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
                  Seconds
                </span>
              </div>
            </div>

            {/* Quick Adjustment Pills */}
            <div className="grid grid-cols-4 gap-2 mt-2.5">
              <button
                type="button"
                onClick={() => handleAdjustSeconds(-60)}
                className="min-h-[44px] py-1.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors border border-slate-200 dark:border-slate-700"
              >
                -1m
              </button>
              <button
                type="button"
                onClick={() => handleAdjustSeconds(-30)}
                className="min-h-[44px] py-1.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors border border-slate-200 dark:border-slate-700"
              >
                -30s
              </button>
              <button
                type="button"
                onClick={() => handleAdjustSeconds(30)}
                className="min-h-[44px] py-1.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors border border-slate-200 dark:border-slate-700"
              >
                +30s
              </button>
              <button
                type="button"
                onClick={() => handleAdjustSeconds(60)}
                className="min-h-[44px] py-1.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors border border-slate-200 dark:border-slate-700"
              >
                +1m
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <span className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
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
                  className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors border ${
                    totalSeconds === preset.seconds
                      ? 'bg-rose-500 text-white border-rose-500'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Efficiency Insight Callout */}
          <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-950 dark:text-emerald-200 flex items-start gap-2.5">
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-emerald-900 dark:text-emerald-100">
                Pace Efficiency Analysis
              </div>
              <div className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5 leading-relaxed">
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
                className="min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 min-h-[44px] py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-rose-500"
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
