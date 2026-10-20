import React from 'react';
import { ExerciseItem } from '../utils/fitnessLogic';

interface Props {
  poseType: ExerciseItem['poseType'];
  depthFactor?: number; // 0 (top) to 1 (bottom of eccentric)
  className?: string;
}

export const ExerciseBodyPositionSvg: React.FC<Props> = ({
  poseType,
  depthFactor = 0.35,
  className = 'w-full h-48',
}) => {
  const d = Math.max(0, Math.min(1, depthFactor));

  return (
    <svg
      viewBox="0 0 320 180"
      className={className}
      role="img"
      aria-label={`Biomechanical body position guide for ${poseType}`}
    >
      <defs>
        <linearGradient id="bgGridGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>
        <linearGradient id="accentRose" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#F43F5E" />
          <stop offset="100%" stopColor="#FB7185" />
        </linearGradient>
        <linearGradient id="accentAmber" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#FBBF24" />
        </linearGradient>
      </defs>

      {/* Studio Background */}
      <rect width="320" height="180" rx="16" fill="url(#bgGridGrad)" />

      {/* Subtle Biomechanical Grid Lines */}
      <line x1="20" y1="150" x2="300" y2="150" stroke="#475569" strokeWidth="2" />
      <line x1="20" y1="90" x2="300" y2="90" stroke="#334155" strokeDasharray="4 4" strokeWidth="1" />
      <line x1="160" y1="18" x2="160" y2="150" stroke="#334155" strokeDasharray="4 4" strokeWidth="1" />

      {poseType === 'pushup' && (() => {
        // Interpolate shoulder & hip Y with depthFactor
        const shoulderY = 92 + d * 36;
        const hipY = 108 + d * 24;
        const elbowY = 116 + d * 18;
        return (
          <g>
            {/* Floor contact markers */}
            <circle cx="80" cy="150" r="4" fill="#F59E0B" />
            <circle cx="225" cy="150" r="4" fill="#F59E0B" />
            {/* Feet to Hips */}
            <line x1="80" y1="148" x2="150" y2={hipY} stroke="#E2E8F0" strokeWidth="7" strokeLinecap="round" />
            {/* Hips to Shoulders (Torso) */}
            <line x1="150" y1={hipY} x2="225" y2={shoulderY} stroke="url(#accentRose)" strokeWidth="9" strokeLinecap="round" />
            {/* Upper Arm & Forearm */}
            <line x1="225" y1={shoulderY} x2="205" y2={elbowY} stroke="#FBBF24" strokeWidth="6" strokeLinecap="round" />
            <line x1="205" y1={elbowY} x2="225" y2="148" stroke="#E2E8F0" strokeWidth="6" strokeLinecap="round" />
            {/* Head */}
            <circle cx="246" cy={shoulderY - 4} r="11" fill="#F8FAFC" stroke="#F43F5E" strokeWidth="3" />
            {/* Direction Arrow */}
            <text x="26" y="34" fill="#94A3B8" fontSize="10" fontFamily="JetBrains Mono, monospace">
              45° ELBOW TUCK · CORE BRACED
            </text>
          </g>
        );
      })()}

      {poseType === 'splitsquat' && (() => {
        const hipY = 74 + d * 32;
        const rearKneeY = 104 + d * 36;
        return (
          <g>
            {/* Bed Edge Block on Left */}
            <rect x="35" y="108" width="52" height="42" rx="6" fill="#334155" stroke="#64748B" strokeWidth="1.5" />
            <text x="45" y="132" fill="#CBD5E1" fontSize="9" fontFamily="JetBrains Mono, monospace">BED</text>
            {/* Rear Foot on Bed to Rear Knee */}
            <line x1="85" y1="112" x2="135" y2={rearKneeY} stroke="#94A3B8" strokeWidth="6" strokeLinecap="round" />
            {/* Rear Knee to Hip */}
            <line x1="135" y1={rearKneeY} x2="165" y2={hipY} stroke="#94A3B8" strokeWidth="7" strokeLinecap="round" />
            {/* Front Hip to Front Knee */}
            <line x1="165" y1={hipY} x2="215" y2="108" stroke="url(#accentRose)" strokeWidth="8" strokeLinecap="round" />
            {/* Front Knee to Front Foot */}
            <line x1="215" y1="108" x2="210" y2="148" stroke="#E2E8F0" strokeWidth="7" strokeLinecap="round" />
            {/* Torso (slight forward lean) */}
            <line x1="165" y1={hipY} x2="180" y2={hipY - 42} stroke="url(#accentAmber)" strokeWidth="9" strokeLinecap="round" />
            {/* Head */}
            <circle cx="184" cy={hipY - 56} r="11" fill="#F8FAFC" stroke="#F59E0B" strokeWidth="3" />
            <text x="26" y="34" fill="#94A3B8" fontSize="10" fontFamily="JetBrains Mono, monospace">
              REAR INSTEP ON BED · 90° KNEE FLEXION
            </text>
          </g>
        );
      })()}

      {poseType === 'pullup' && (() => {
        // d = 0 is top of pullup (chin at ledge), d = 1 is dead hang
        const headY = 54 + d * 34;
        const shoulderY = 72 + d * 34;
        const hipY = 114 + d * 28;
        return (
          <g>
            {/* Overhead Door/Beam Ledge */}
            <rect x="90" y="22" width="140" height="10" rx="4" fill="#475569" />
            {/* Folded White Towel Grip */}
            <rect x="135" y="20" width="50" height="16" rx="4" fill="#F8FAFC" stroke="#F59E0B" strokeWidth="2" />
            <text x="200" y="32" fill="#FBBF24" fontSize="9" fontFamily="JetBrains Mono, monospace">TOWEL GRIP</text>
            {/* Arms from Towel to Shoulders */}
            <line x1="145" y1="34" x2="132" y2={shoulderY - 6} stroke="#FBBF24" strokeWidth="5" strokeLinecap="round" />
            <line x1="175" y1="34" x2="188" y2={shoulderY - 6} stroke="#FBBF24" strokeWidth="5" strokeLinecap="round" />
            <line x1="132" y1={shoulderY - 6} x2="148" y2={shoulderY} stroke="#E2E8F0" strokeWidth="6" strokeLinecap="round" />
            <line x1="188" y1={shoulderY - 6} x2="172" y2={shoulderY} stroke="#E2E8F0" strokeWidth="6" strokeLinecap="round" />
            {/* Head */}
            <circle cx="160" cy={headY} r="11" fill="#F8FAFC" stroke="#F43F5E" strokeWidth="3" />
            {/* Torso */}
            <line x1="160" y1={shoulderY} x2="160" y2={hipY} stroke="url(#accentRose)" strokeWidth="10" strokeLinecap="round" />
            {/* Legs */}
            <line x1="160" y1={hipY} x2="152" y2={hipY + 30} stroke="#E2E8F0" strokeWidth="6" strokeLinecap="round" />
            <line x1="160" y1={hipY} x2="168" y2={hipY + 30} stroke="#E2E8F0" strokeWidth="6" strokeLinecap="round" />
            <text x="22" y="168" fill="#94A3B8" fontSize="10" fontFamily="JetBrains Mono, monospace">
              SCAPULAR DEPRESSION · 4s ECCENTRIC NEGATIVE
            </text>
          </g>
        );
      })()}

      {poseType === 'pikepushup' && (() => {
        const headY = 104 + d * 34;
        const shoulderY = 88 + d * 28;
        return (
          <g>
            {/* Bed Edge on Left for Feet */}
            <rect x="40" y="96" width="48" height="54" rx="6" fill="#334155" stroke="#64748B" strokeWidth="1.5" />
            {/* Legs from Bed to High Pike Hip */}
            <line x1="85" y1="98" x2="150" y2="52" stroke="#E2E8F0" strokeWidth="7" strokeLinecap="round" />
            {/* Torso from High Hip to Shoulders */}
            <line x1="150" y1="52" x2="205" y2={shoulderY} stroke="url(#accentRose)" strokeWidth="9" strokeLinecap="round" />
            {/* Arms to Floor */}
            <line x1="205" y1={shoulderY} x2="225" y2="148" stroke="#FBBF24" strokeWidth="6" strokeLinecap="round" />
            {/* Head Forming Tripod */}
            <circle cx="218" cy={headY} r="10" fill="#F8FAFC" stroke="#F43F5E" strokeWidth="3" />
            <text x="26" y="34" fill="#94A3B8" fontSize="10" fontFamily="JetBrains Mono, monospace">
              INVERTED V-PIKE · TRIPOD HEAD PATH
            </text>
          </g>
        );
      })()}

      {poseType === 'warmup' && (() => {
        const twistOffset = (d - 0.5) * 18;
        return (
          <g>
            {/* Rear Leg Extended */}
            <line x1="75" y1="148" x2="155" y2="118" stroke="#94A3B8" strokeWidth="7" strokeLinecap="round" />
            {/* Front Leg Lunged */}
            <line x1="155" y1="118" x2="215" y2="112" stroke="url(#accentRose)" strokeWidth="8" strokeLinecap="round" />
            <line x1="215" y1="112" x2="215" y2="148" stroke="#E2E8F0" strokeWidth="7" strokeLinecap="round" />
            {/* Torso Rotating */}
            <line x1="155" y1="118" x2="175" y2="74" stroke="url(#accentAmber)" strokeWidth="9" strokeLinecap="round" />
            {/* Thoracic Reach Arm */}
            <line x1="175" y1="78" x2={195 + twistOffset} y2={42} stroke="#34D399" strokeWidth="5" strokeLinecap="round" />
            <circle cx="178" cy="58" r="11" fill="#F8FAFC" stroke="#10B981" strokeWidth="3" />
            <text x="26" y="34" fill="#94A3B8" fontSize="10" fontFamily="JetBrains Mono, monospace">
              THORACIC ROTATION · SCAPULAR GLIDE
            </text>
          </g>
        );
      })()}

      {poseType === 'cobra' && (() => {
        const chestLift = 86 - d * 18;
        return (
          <g>
            {/* Legs & Hips Grounded on Mat */}
            <line x1="70" y1="146" x2="175" y2="146" stroke="#E2E8F0" strokeWidth="8" strokeLinecap="round" />
            {/* Lumbar & Thoracic Extension Curve */}
            <path
              d={`M 175 146 Q 210 138 228 ${chestLift}`}
              fill="none"
              stroke="url(#accentRose)"
              strokeWidth="9"
              strokeLinecap="round"
            />
            {/* Supporting Arms */}
            <line x1="224" y1={chestLift + 6} x2="220" y2="148" stroke="#FBBF24" strokeWidth="6" strokeLinecap="round" />
            {/* Head */}
            <circle cx="234" cy={chestLift - 14} r="11" fill="#F8FAFC" stroke="#10B981" strokeWidth="3" />
            <text x="26" y="34" fill="#94A3B8" fontSize="10" fontFamily="JetBrains Mono, monospace">
              COBRA EXTENSION · 4-7-8 NASAL RECOVERY
            </text>
          </g>
        );
      })()}
    </svg>
  );
};

export const SharifAvatarSvg: React.FC<{ name?: string; className?: string }> = ({
  name = 'Sharif',
  className = 'w-10 h-10',
}) => {
  const initial = (name || 'S').charAt(0).toUpperCase();
  return (
    <svg
      viewBox="0 0 64 64"
      className={`${className} rounded-full shrink-0`}
      role="img"
      aria-label={`${name} profile avatar`}
    >
      <defs>
        <linearGradient id="avatarGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F43F5E" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="32" fill="url(#avatarGrad)" />
      <circle cx="32" cy="24" r="10" fill="#FFF1F2" opacity="0.92" />
      <path d="M16 54 C16 42 48 42 48 54" fill="#FFF1F2" opacity="0.92" />
      <text
        x="32"
        y="28"
        textAnchor="middle"
        fill="#881337"
        fontSize="11"
        fontWeight="700"
        fontFamily="Outfit, sans-serif"
      >
        {initial}
      </text>
    </svg>
  );
};
