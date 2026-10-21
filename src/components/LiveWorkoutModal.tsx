import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { ExerciseItem, calculateTempoState } from '../utils/fitnessLogic';
import { ExerciseBodyPositionSvg } from './ExerciseBodyPositionSvg';

interface Props {
  exercises: ExerciseItem[];
  activeIndex: number;
  completedIds: string[];
  onSelectExercise: (index: number) => void;
  onToggleComplete: (id: string) => void;
  onStartTimer?: () => void;
  onClose: () => void;
}

export const LiveWorkoutModal: React.FC<Props> = ({
  exercises,
  activeIndex,
  completedIds,
  onSelectExercise,
  onToggleComplete,
  onStartTimer,
  onClose,
}) => {
  const exercise = exercises[activeIndex] || exercises[0];
  const isCompleted = completedIds.includes(exercise.id);

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [mode, setMode] = useState<'work' | 'rest'>('work');
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [secondsLeft, setSecondsLeft] = useState<number>(exercise.workSeconds);
  const [elapsedWorkMs, setElapsedWorkMs] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastPhaseRef = useRef<string>('');

  // Reset state when switching exercise
  useEffect(() => {
    setIsRunning(false);
    setMode('work');
    setCurrentRound(1);
    setSecondsLeft(exercise.workSeconds);
    setElapsedWorkMs(0);
    lastPhaseRef.current = '';
  }, [exercise.id, exercise.workSeconds]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const playBeep = useCallback(
    (freq = 660, durationMs = 90, type: OscillatorType = 'sine') => {
      if (!soundEnabled) return;
      try {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(40);
        }
        const AudioContextClass =
          window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) return;
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioContextClass();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + durationMs / 1000);
      } catch {
        // Ignore audio context autoplay restrictions in headless browser
      }
    },
    [soundEnabled]
  );

  // Main 100ms precision timer for smooth 3-1-1 tempo bar & countdown
  useEffect(() => {
    if (!isRunning) return;

    const interval = window.setInterval(() => {
      if (mode === 'work') {
        setElapsedWorkMs((prevMs) => {
          const nextMs = prevMs + 100;
          const totalWorkMs = exercise.workSeconds * 1000;

          const tempo = calculateTempoState(nextMs);
          if (tempo.phaseShort !== lastPhaseRef.current) {
            lastPhaseRef.current = tempo.phaseShort;
            if (tempo.phaseShort === 'LOWER 3s') playBeep(520, 70, 'sine');
            if (tempo.phaseShort === 'HOLD 1s') playBeep(680, 70, 'triangle');
            if (tempo.phaseShort === 'DRIVE 1s') playBeep(880, 110, 'sine');
          }

          const remainingSec = Math.max(0, Math.ceil((totalWorkMs - nextMs) / 1000));
          setSecondsLeft(remainingSec);

          if (nextMs >= totalWorkMs) {
            playBeep(980, 220, 'square');
            setMode('rest');
            setSecondsLeft(exercise.restSeconds);
            return 0;
          }
          return nextMs;
        });
      } else {
        // Rest mode ticks every 100ms via internal accumulator or 1s check
        setElapsedWorkMs((prevRestMs) => {
          const nextRestMs = prevRestMs + 100;
          const totalRestMs = exercise.restSeconds * 1000;
          const remainingSec = Math.max(0, Math.ceil((totalRestMs - nextRestMs) / 1000));
          setSecondsLeft(remainingSec);

          if (nextRestMs >= totalRestMs) {
            playBeep(740, 180, 'sine');
            if (currentRound < exercise.rounds) {
              setCurrentRound((r) => r + 1);
              setMode('work');
              setSecondsLeft(exercise.workSeconds);
              return 0;
            } else {
              setIsRunning(false);
              if (!isCompleted) {
                onToggleComplete(exercise.id);
              }
              return 0;
            }
          }
          return nextRestMs;
        });
      }
    }, 100);

    return () => window.clearInterval(interval);
  }, [
    isRunning,
    mode,
    currentRound,
    exercise.workSeconds,
    exercise.restSeconds,
    exercise.rounds,
    exercise.id,
    isCompleted,
    onToggleComplete,
    playBeep,
  ]);

  const tempoState = calculateTempoState(mode === 'work' ? elapsedWorkMs : 0);

  const handleReset = () => {
    setIsRunning(false);
    setMode('work');
    setCurrentRound(1);
    setSecondsLeft(exercise.workSeconds);
    setElapsedWorkMs(0);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="live-workout-modal-title"
    >
      <div className="w-full max-w-3xl bg-slate-900 text-white border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl my-auto bento-card-tactile">
        {/* Modal Header */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="text-xs text-rose-400 font-medium tracking-wide">
              Step {exercise.stepNumber} of 06 · {exercise.targetMuscles}
            </div>
            <h2 id="live-workout-modal-title" className="text-xl sm:text-2xl font-bold tracking-tight mt-0.5">
              {exercise.name}
            </h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setSoundEnabled((s) => !s)}
              aria-label={soundEnabled ? 'Mute tempo audio cues' : 'Unmute tempo audio cues'}
              className="min-h-[44px] min-w-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-200 transition-colors tactile-button focus-ring-tactile"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5 text-amber-400" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close live workout mode"
              className="min-h-[44px] min-w-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-200 transition-colors tactile-button focus-ring-tactile"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main 2-Column Live Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-5 items-stretch">
          {/* Left Column: Live Body Position & Tempo Guide */}
          <div className="md:col-span-7 flex flex-col justify-between bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 shadow-inner">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-medium">Live Biomechanical Position</span>
              <span className="font-mono tabular-nums text-amber-400 font-semibold">
                Rep #{tempoState.repNumber} · {exercise.prescribedReps}
              </span>
            </div>

            <ExerciseBodyPositionSvg
              poseType={exercise.poseType}
              depthFactor={isRunning && mode === 'work' ? tempoState.bodyDepthFactor : 0.45}
              className="w-full h-48 sm:h-52 rounded-xl"
            />

            {/* Visual 3-1-1 Tempo Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-slate-200">
                  3-1-1 Hypertrophy Tempo Cadence
                </span>
                <span className="font-mono tabular-nums text-rose-400 font-semibold">
                  {mode === 'work' ? tempoState.phase : '15s Active Recovery Rest'}
                </span>
              </div>

              {/* 3-segment visual bar: 3s Lower (60%) | 1s Hold (20%) | 1s Drive (20%) */}
              <div
                role="progressbar"
                aria-label="3-1-1 tempo phase progress"
                aria-valuenow={Math.round(tempoState.phaseProgressPercent)}
                aria-valuemin={0}
                aria-valuemax={100}
                className="grid grid-cols-5 gap-1.5 h-3.5 w-full rounded-lg overflow-hidden bg-slate-800 p-0.5 border border-slate-700/60"
              >
                <div className="col-span-3 bg-slate-900 rounded overflow-hidden relative shadow-inner">
                  <div
                    className="h-full bg-rose-500 transition-all duration-100"
                    style={{
                      width:
                        mode === 'work'
                          ? tempoState.phaseShort === 'LOWER 3s'
                            ? `${tempoState.phaseProgressPercent}%`
                            : '100%'
                          : '0%',
                    }}
                  />
                </div>
                <div className="col-span-1 bg-slate-900 rounded overflow-hidden relative shadow-inner">
                  <div
                    className="h-full bg-amber-400 transition-all duration-100"
                    style={{
                      width:
                        mode === 'work'
                          ? tempoState.phaseShort === 'HOLD 1s'
                            ? `${tempoState.phaseProgressPercent}%`
                            : tempoState.phaseShort === 'DRIVE 1s'
                            ? '100%'
                            : '0%'
                          : '0%',
                    }}
                  />
                </div>
                <div className="col-span-1 bg-slate-900 rounded overflow-hidden relative shadow-inner">
                  <div
                    className="h-full bg-emerald-400 transition-all duration-100"
                    style={{
                      width:
                        mode === 'work' && tempoState.phaseShort === 'DRIVE 1s'
                          ? `${tempoState.phaseProgressPercent}%`
                          : '0%',
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-5 text-[11px] text-slate-400 mt-1.5 font-mono tabular-nums">
                <span className="col-span-3 text-rose-300 font-medium">3s Eccentric Lower</span>
                <span className="col-span-1 text-amber-300 text-center font-medium">1s Hold</span>
                <span className="col-span-1 text-emerald-300 text-right font-medium">1s Drive</span>
              </div>
            </div>
          </div>

          {/* Right Column: 45s / 15s Countdown Timer & Coaching Cues */}
          <div className="md:col-span-5 flex flex-col justify-between bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5 shadow-inner">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-medium">
                  Round {currentRound} of {exercise.rounds}
                </span>
                <span className={mode === 'work' ? 'text-rose-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                  {mode === 'work' ? '45s WORK SET' : '15s REST WINDOW'}
                </span>
              </div>

              {/* Large Tabular Countdown with Neomorphic Depth */}
              <div className="my-4 text-center py-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
                <div className="font-mono tabular-nums text-5xl sm:text-6xl font-bold tracking-tight text-white">
                  00:{String(secondsLeft).padStart(2, '0')}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Target: {exercise.prescribedReps}
                </div>
              </div>

              {/* Primary Timer Controls */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsRunning((r) => {
                      if (!r) {
                        onStartTimer?.();
                        return true;
                      }
                      return false;
                    });
                  }}
                  className="flex-1 min-h-[48px] px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0 tactile-button focus-ring-tactile shadow-md"
                >
                  {isRunning ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>Pause Set</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>{elapsedWorkMs > 0 ? 'Resume Set' : 'Start 45s Set'}</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  aria-label="Reset set timer"
                  className="min-h-[48px] min-w-[48px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors shrink-0 tactile-button focus-ring-tactile"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Form Cues List */}
            <div className="mt-5 pt-4 border-t border-slate-800/80">
              <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Form & Execution Cues</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
                {exercise.cues.map((cue, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-mono text-rose-400 font-semibold">{idx + 1}.</span>
                    <span>{cue}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Navigation & Mark Complete */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={activeIndex === 0}
              onClick={() => onSelectExercise(Math.max(0, activeIndex - 1))}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 tactile-button focus-ring-tactile"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Exercise</span>
            </button>
            <button
              type="button"
              disabled={activeIndex === exercises.length - 1}
              onClick={() => onSelectExercise(Math.min(exercises.length - 1, activeIndex + 1))}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 tactile-button focus-ring-tactile"
            >
              <span>Next Exercise</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => onToggleComplete(exercise.id)}
            className={`min-h-[44px] px-5 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 tactile-button focus-ring-tactile shadow-md ${
              isCompleted
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isCompleted ? 'Exercise Completed' : 'Mark Exercise Complete'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
