import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Check,
  CheckCircle2,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  DYNAMIC_MOBILITY_EXERCISES,
  calculateMobilityCompletion,
  MobilityExerciseItem,
} from '../utils/fitnessLogic';

interface Props {
  completedMobilityIds: string[];
  onToggleMobility: (id: string) => void;
  onSetAllMobility: (completed: boolean) => void;
  darkMode?: boolean;
}

// Biomechanical mini SVG illustration for each mobility exercise
const MobilityBiomechanicalSvg: React.FC<{
  poseType: MobilityExerciseItem['poseType'];
  isActiveTimer: boolean;
}> = ({ poseType, isActiveTimer }) => {
  return (
    <svg
      viewBox="0 0 280 140"
      className="w-full h-32 rounded-2xl overflow-hidden transition-all duration-300"
      role="img"
      aria-label={`Biomechanical guide for ${poseType}`}
    >
      <defs>
        <linearGradient id={`grad-${poseType}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>
        <linearGradient id="roseAccent" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#F43F5E" />
          <stop offset="100%" stopColor="#FB7185" />
        </linearGradient>
        <linearGradient id="amberAccent" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#FBBF24" />
        </linearGradient>
      </defs>

      {/* Dark Studio Base */}
      <rect width="280" height="140" fill={`url(#grad-${poseType})`} />

      {/* Grid Lines */}
      <line x1="20" y1="120" x2="260" y2="120" stroke="#334155" strokeWidth="1.5" />
      <line x1="140" y1="15" x2="140" y2="120" stroke="#334155" strokeDasharray="3 3" strokeWidth="1" />

      {poseType === 'armcircles' && (
        <g>
          {/* Torso & Head */}
          <line x1="140" y1="46" x2="140" y2="92" stroke="#E2E8F0" strokeWidth="7" strokeLinecap="round" />
          <circle cx="140" cy="30" r="10" fill="#F8FAFC" stroke="#F43F5E" strokeWidth="2.5" />
          {/* Standing Legs */}
          <line x1="140" y1="92" x2="124" y2="120" stroke="#94A3B8" strokeWidth="6" strokeLinecap="round" />
          <line x1="140" y1="92" x2="156" y2="120" stroke="#94A3B8" strokeWidth="6" strokeLinecap="round" />
          {/* Horizontal Arms Extended */}
          <line x1="90" y1="52" x2="190" y2="52" stroke="url(#roseAccent)" strokeWidth="6" strokeLinecap="round" />
          {/* Shoulder Joint Pivot Dots */}
          <circle cx="118" cy="52" r="5" fill="#F59E0B" />
          <circle cx="162" cy="52" r="5" fill="#F59E0B" />
          {/* Rotation Guides with Dash Array */}
          <circle
            cx="80"
            cy="52"
            r="20"
            fill="none"
            stroke="#38BDF8"
            strokeWidth="2"
            strokeDasharray="4 3"
            className={isActiveTimer ? 'animate-spin origin-[80px_52px]' : ''}
          />
          <circle
            cx="200"
            cy="52"
            r="20"
            fill="none"
            stroke="#38BDF8"
            strokeWidth="2"
            strokeDasharray="4 3"
            className={isActiveTimer ? 'animate-spin origin-[200px_52px]' : ''}
          />
          <text x="14" y="24" fill="#38BDF8" fontSize="9" fontFamily="JetBrains Mono, monospace">
            CIRCULAR ROTATION · 360° CAPSULE GLIDE
          </text>
        </g>
      )}

      {poseType === 'legswings' && (
        <g>
          {/* Support Bar / Wall */}
          <line x1="60" y1="20" x2="60" y2="120" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
          {/* Support Arm */}
          <line x1="60" y1="50" x2="115" y2="50" stroke="#94A3B8" strokeWidth="5" strokeLinecap="round" />
          {/* Torso & Head */}
          <line x1="115" y1="46" x2="118" y2="88" stroke="#E2E8F0" strokeWidth="7" strokeLinecap="round" />
          <circle cx="114" cy="28" r="10" fill="#F8FAFC" stroke="#F59E0B" strokeWidth="2.5" />
          {/* Standing Leg */}
          <line x1="118" y1="88" x2="118" y2="120" stroke="#64748B" strokeWidth="6" strokeLinecap="round" />
          {/* Hip Joint Center */}
          <circle cx="118" cy="88" r="5" fill="#F43F5E" />
          {/* Swinging Leg (Angled forward) */}
          <line
            x1="118"
            y1="88"
            x2={isActiveTimer ? 172 : 162}
            y2={isActiveTimer ? 104 : 110}
            stroke="url(#roseAccent)"
            strokeWidth="7"
            strokeLinecap="round"
          />
          {/* Dynamic Arc Guide */}
          <path
            d="M 80 114 Q 120 128 175 106"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="2"
            strokeDasharray="4 3"
          />
          <text x="14" y="24" fill="#FBBF24" fontSize="9" fontFamily="JetBrains Mono, monospace">
            HIP ACETABULAR OPENING · HAMSTRING ARC
          </text>
        </g>
      )}

      {poseType === 'torsotwists' && (
        <g>
          {/* Head & Spine Axis */}
          <circle cx="140" cy="28" r="10" fill="#F8FAFC" stroke="#10B981" strokeWidth="2.5" />
          <line x1="140" y1="42" x2="140" y2="88" stroke="#E2E8F0" strokeWidth="7" strokeLinecap="round" />
          {/* Standing Legs with pivoted trailing foot */}
          <line x1="140" y1="88" x2="118" y2="120" stroke="#94A3B8" strokeWidth="6" strokeLinecap="round" />
          <line x1="140" y1="88" x2="162" y2="120" stroke="#94A3B8" strokeWidth="6" strokeLinecap="round" />
          {/* Rotated Shoulders and Arms at 90 deg */}
          <line x1="105" y1="44" x2="175" y2="56" stroke="url(#roseAccent)" strokeWidth="8" strokeLinecap="round" />
          <line x1="105" y1="44" x2="96" y2="66" stroke="#FBBF24" strokeWidth="5" strokeLinecap="round" />
          <line x1="175" y1="56" x2="184" y2="78" stroke="#FBBF24" strokeWidth="5" strokeLinecap="round" />
          {/* Spine Pivot Joint Markers */}
          <circle cx="140" cy="50" r="4" fill="#38BDF8" />
          <circle cx="140" cy="72" r="4" fill="#38BDF8" />
          {/* Transverse Rotational Torque Arrows */}
          <path
            d="M 90 78 Q 140 94 190 78"
            fill="none"
            stroke="#10B981"
            strokeWidth="2.5"
            strokeDasharray="4 3"
          />
          <text x="14" y="24" fill="#34D399" fontSize="9" fontFamily="JetBrains Mono, monospace">
            THORACIC ROTATION · TRANSVERSE PLANE
          </text>
        </g>
      )}
    </svg>
  );
};

export const PreWorkoutMobilitySection: React.FC<Props> = ({
  completedMobilityIds,
  onToggleMobility,
  onSetAllMobility,
}) => {
  const { completedCount, totalRequired, isAllPrimed, completionPercent } =
    calculateMobilityCompletion(completedMobilityIds);

  // Per-exercise timer states
  const [activeTimerId, setActiveTimerId] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(45);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const playCueSound = (freq = 660, durationMs = 120) => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtxClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationMs / 1000);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + durationMs / 1000);
    } catch {
      // Audio not supported in environment
    }
  };

  useEffect(() => {
    let timer: number | null = null;
    if (activeTimerId) {
      timer = window.setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            // Finished
            playCueSound(880, 240);
            if (activeTimerId && !completedMobilityIds.includes(activeTimerId)) {
              onToggleMobility(activeTimerId);
            }
            setActiveTimerId(null);
            return 45;
          }
          if (prev <= 4) {
            playCueSound(520, 80);
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeTimerId, completedMobilityIds, onToggleMobility]);

  const handleStartTimer = (id: string) => {
    if (activeTimerId === id) {
      // Pause
      setActiveTimerId(null);
    } else {
      setActiveTimerId(id);
      setSecondsLeft(45);
      playCueSound(600, 100);
    }
  };

  const handleResetTimer = (id: string) => {
    if (activeTimerId === id) {
      setActiveTimerId(null);
    }
    setSecondsLeft(45);
  };

  return (
    <div
      data-testid="pre-workout-dynamic-mobility-section"
      className="bg-white border border-slate-200 rounded-3xl p-6 transition-all"
    >
      {/* Header with Title and Primed Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-rose-500 font-semibold tracking-wider">
            <Activity className="w-3.5 h-3.5" />
            <span>PHASE 2A · PRE-WORKOUT DYNAMIC MOBILITY (2-3 MINS)</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <span>Pre-Workout Dynamic Mobility</span>
            {isAllPrimed && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium flex items-center gap-1 font-mono">
                <Check className="w-3 h-3 stroke-[3]" />
                Joints Ready
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Perform these 3 light-intensity joint preparation exercises before starting Round 1 of your heavy 3-1-1 circuit. Lubricates the glenohumeral, hip acetabular, and thoracic joints with active synovial fluid to prevent impingement and maximize range of motion.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setSoundEnabled((prev) => !prev)}
            aria-label={soundEnabled ? 'Mute timer sound' : 'Enable timer sound'}
            className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => onSetAllMobility(!isAllPrimed)}
            data-testid="toggle-all-mobility-btn"
            className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              isAllPrimed
                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            {isAllPrimed ? (
              <>
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Joint Drills</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Prime All 3 Drills</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress Track */}
      <div className="mt-3 flex items-center justify-between gap-4 text-xs">
        <span className="text-slate-500">
          Joint Readiness:{' '}
          <strong className="text-slate-900 font-mono tabular-nums">
            {completedCount} / {totalRequired} Drills Primed ({completionPercent}%)
          </strong>
        </span>
        <div className="w-32 sm:w-44 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      {/* 3 Mobility Exercise Bento Cards */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {DYNAMIC_MOBILITY_EXERCISES.map((drill) => {
          const isDone = completedMobilityIds.includes(drill.id);
          const isTimerActive = activeTimerId === drill.id;

          return (
            <article
              key={drill.id}
              data-testid={`mobility-card-${drill.id}`}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                isDone
                  ? 'bg-emerald-50/30 border-emerald-300'
                  : isTimerActive
                  ? 'bg-rose-50/20 border-rose-300 shadow-sm'
                  : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Header Metadata */}
                <div className="flex items-center justify-between text-xs font-mono tabular-nums text-slate-500">
                  <span className="font-semibold text-rose-500">{drill.stepNumber}</span>
                  <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                    {drill.intensity}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 mt-1.5 leading-snug">
                  {drill.name}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  {drill.subtitle}
                </p>

                {/* Biomechanical Illustrated SVG */}
                <div className="mt-2.5 rounded-xl overflow-hidden shadow-xs">
                  <MobilityBiomechanicalSvg
                    poseType={drill.poseType}
                    isActiveTimer={isTimerActive}
                  />
                </div>

                {/* Prescribed reps and benefit */}
                <div className="mt-3 space-y-1.5">
                  <div className="text-xs font-mono tabular-nums text-slate-800">
                    Target: <strong className="text-slate-900 font-semibold">{drill.repsLabel}</strong>
                  </div>
                  <div className="text-[11px] text-slate-500 leading-snug">
                    <span className="font-medium text-slate-700">Joints:</span> {drill.targetJoints}
                  </div>
                  <div className="text-[11px] text-slate-600 bg-white/70 border border-slate-200/80 rounded-xl p-2.5 leading-relaxed">
                    {drill.jointBenefits}
                  </div>
                </div>
              </div>

              {/* Action Buttons & Timer */}
              <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center gap-2">
                {/* Interactive 45s countdown timer button */}
                <button
                  type="button"
                  onClick={() => handleStartTimer(drill.id)}
                  aria-label={
                    isTimerActive
                      ? `Pause ${drill.name} timer at ${secondsLeft}s`
                      : `Start 45s timer for ${drill.name}`
                  }
                  className={`flex-1 min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                    isTimerActive
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {isTimerActive ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span className="font-mono tabular-nums">{secondsLeft}s (Pause)</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>{isDone ? 'Replay 45s' : 'Start 45s Drill'}</span>
                    </>
                  )}
                </button>

                {isTimerActive && (
                  <button
                    type="button"
                    onClick={() => handleResetTimer(drill.id)}
                    aria-label={`Reset ${drill.name} timer`}
                    className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Direct complete checkmark button */}
                <button
                  type="button"
                  onClick={() => onToggleMobility(drill.id)}
                  aria-label={isDone ? `Mark ${drill.name} unprimed` : `Mark ${drill.name} primed`}
                  className={`min-h-[40px] min-w-[40px] px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center transition-colors shrink-0 ${
                    isDone
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  ) : (
                    <Check className="w-4 h-4 text-slate-400" />
                  )}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
