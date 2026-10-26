import React from 'react';
import { Camera } from 'lucide-react';
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
      {/* Studio Background - Solid Dark Neutral */}
      <rect width="320" height="180" rx="12" fill="#0F172A" />

      {/* Subtle Biomechanical Grid Lines */}
      <line x1="20" y1="150" x2="300" y2="150" stroke="#334155" strokeWidth="1.5" />
      <line x1="20" y1="90" x2="300" y2="90" stroke="#1E293B" strokeDasharray="4 4" strokeWidth="1" />
      <line x1="160" y1="18" x2="160" y2="150" stroke="#1E293B" strokeDasharray="4 4" strokeWidth="1" />

      {poseType === 'pushup' && (() => {
        const shoulderY = 92 + d * 36;
        const hipY = 108 + d * 24;
        const elbowY = 116 + d * 18;
        return (
          <g>
            {/* Floor contact markers */}
            <circle cx="80" cy="150" r="4" fill="#64748B" />
            <circle cx="225" cy="150" r="4" fill="#64748B" />
            {/* Feet to Hips */}
            <line x1="80" y1="148" x2="150" y2={hipY} stroke="#94A3B8" strokeWidth="7" strokeLinecap="round" />
            {/* Hips to Shoulders (Torso) */}
            <line x1="150" y1={hipY} x2="225" y2={shoulderY} stroke="#F43F5E" strokeWidth="9" strokeLinecap="round" />
            {/* Upper Arm & Forearm */}
            <line x1="225" y1={shoulderY} x2="205" y2={elbowY} stroke="#CBD5E1" strokeWidth="6" strokeLinecap="round" />
            <line x1="205" y1={elbowY} x2="225" y2="148" stroke="#E2E8F0" strokeWidth="6" strokeLinecap="round" />
            {/* Head */}
            <circle cx="246" cy={shoulderY - 4} r="11" fill="#F8FAFC" stroke="#F43F5E" strokeWidth="2.5" />
            <text x="24" y="32" fill="#94A3B8" fontSize="12" fontFamily="Poppins, sans-serif">
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
            <rect x="35" y="108" width="52" height="42" rx="6" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
            <text x="44" y="133" fill="#94A3B8" fontSize="12" fontFamily="Poppins, sans-serif">BED</text>
            {/* Rear Foot on Bed to Rear Knee */}
            <line x1="85" y1="112" x2="135" y2={rearKneeY} stroke="#94A3B8" strokeWidth="6" strokeLinecap="round" />
            {/* Rear Knee to Hip */}
            <line x1="135" y1={rearKneeY} x2="165" y2={hipY} stroke="#94A3B8" strokeWidth="7" strokeLinecap="round" />
            {/* Front Hip to Front Knee */}
            <line x1="165" y1={hipY} x2="215" y2="108" stroke="#F43F5E" strokeWidth="8" strokeLinecap="round" />
            {/* Front Knee to Front Foot */}
            <line x1="215" y1="108" x2="210" y2="148" stroke="#E2E8F0" strokeWidth="7" strokeLinecap="round" />
            {/* Torso */}
            <line x1="165" y1={hipY} x2="180" y2={hipY - 42} stroke="#CBD5E1" strokeWidth="9" strokeLinecap="round" />
            {/* Head */}
            <circle cx="184" cy={hipY - 56} r="11" fill="#F8FAFC" stroke="#F43F5E" strokeWidth="2.5" />
            <text x="24" y="32" fill="#94A3B8" fontSize="12" fontFamily="Poppins, sans-serif">
              REAR INSTEP ON BED · 90° KNEE FLEXION
            </text>
          </g>
        );
      })()}

      {poseType === 'pullup' && (() => {
        const headY = 54 + d * 34;
        const shoulderY = 72 + d * 34;
        const hipY = 114 + d * 28;
        return (
          <g>
            {/* Overhead Door/Beam Ledge */}
            <rect x="90" y="20" width="140" height="12" rx="4" fill="#334155" />
            {/* Folded White Towel Grip */}
            <rect x="135" y="18" width="50" height="16" rx="4" fill="#F8FAFC" stroke="#64748B" strokeWidth="1.5" />
            <text x="195" y="30" fill="#E2E8F0" fontSize="12" fontFamily="Poppins, sans-serif">TOWEL GRIP</text>
            {/* Arms from Towel to Shoulders */}
            <line x1="145" y1="34" x2="132" y2={shoulderY - 6} stroke="#CBD5E1" strokeWidth="5" strokeLinecap="round" />
            <line x1="175" y1="34" x2="188" y2={shoulderY - 6} stroke="#CBD5E1" strokeWidth="5" strokeLinecap="round" />
            <line x1="132" y1={shoulderY - 6} x2="148" y2={shoulderY} stroke="#E2E8F0" strokeWidth="6" strokeLinecap="round" />
            <line x1="188" y1={shoulderY - 6} x2="172" y2={shoulderY} stroke="#E2E8F0" strokeWidth="6" strokeLinecap="round" />
            {/* Head */}
            <circle cx="160" cy={headY} r="11" fill="#F8FAFC" stroke="#F43F5E" strokeWidth="2.5" />
            {/* Torso */}
            <line x1="160" y1={shoulderY} x2="160" y2={hipY} stroke="#F43F5E" strokeWidth="10" strokeLinecap="round" />
            {/* Legs */}
            <line x1="160" y1={hipY} x2="152" y2={hipY + 30} stroke="#94A3B8" strokeWidth="6" strokeLinecap="round" />
            <line x1="160" y1={hipY} x2="168" y2={hipY + 30} stroke="#94A3B8" strokeWidth="6" strokeLinecap="round" />
            <text x="24" y="168" fill="#94A3B8" fontSize="12" fontFamily="Poppins, sans-serif">
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
            <rect x="40" y="96" width="48" height="54" rx="6" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
            {/* Legs from Bed to High Pike Hip */}
            <line x1="85" y1="98" x2="150" y2="52" stroke="#94A3B8" strokeWidth="7" strokeLinecap="round" />
            {/* Torso from High Hip to Shoulders */}
            <line x1="150" y1="52" x2="205" y2={shoulderY} stroke="#F43F5E" strokeWidth="9" strokeLinecap="round" />
            {/* Arms to Floor */}
            <line x1="205" y1={shoulderY} x2="225" y2="148" stroke="#CBD5E1" strokeWidth="6" strokeLinecap="round" />
            {/* Head Forming Tripod */}
            <circle cx="218" cy={headY} r="10" fill="#F8FAFC" stroke="#F43F5E" strokeWidth="2.5" />
            <text x="24" y="32" fill="#94A3B8" fontSize="12" fontFamily="Poppins, sans-serif">
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
            <line x1="155" y1="118" x2="215" y2="112" stroke="#F43F5E" strokeWidth="8" strokeLinecap="round" />
            <line x1="215" y1="112" x2="215" y2="148" stroke="#E2E8F0" strokeWidth="7" strokeLinecap="round" />
            {/* Torso Rotating */}
            <line x1="155" y1="118" x2="175" y2="74" stroke="#CBD5E1" strokeWidth="9" strokeLinecap="round" />
            {/* Reach Arm */}
            <line x1="175" y1="78" x2={195 + twistOffset} y2={42} stroke="#E2E8F0" strokeWidth="5" strokeLinecap="round" />
            <circle cx="178" cy="58" r="11" fill="#F8FAFC" stroke="#F43F5E" strokeWidth="2.5" />
            <text x="24" y="32" fill="#94A3B8" fontSize="12" fontFamily="Poppins, sans-serif">
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
            <line x1="70" y1="146" x2="175" y2="146" stroke="#94A3B8" strokeWidth="8" strokeLinecap="round" />
            {/* Lumbar & Thoracic Extension Curve */}
            <path
              d={`M 175 146 Q 210 138 228 ${chestLift}`}
              fill="none"
              stroke="#F43F5E"
              strokeWidth="9"
              strokeLinecap="round"
            />
            {/* Supporting Arms */}
            <line x1="224" y1={chestLift + 6} x2="220" y2="148" stroke="#CBD5E1" strokeWidth="6" strokeLinecap="round" />
            {/* Head */}
            <circle cx="234" cy={chestLift - 14} r="11" fill="#F8FAFC" stroke="#F43F5E" strokeWidth="2.5" />
            <text x="24" y="32" fill="#94A3B8" fontSize="12" fontFamily="Poppins, sans-serif">
              COBRA EXTENSION · 4-7-8 NASAL RECOVERY
            </text>
          </g>
        );
      })()}
    </svg>
  );
};

export interface AthleteAvatarProps {
  name?: string;
  avatarUrl?: string;
  className?: string;
  editable?: boolean;
  onEdit?: () => void;
  showBadge?: boolean;
}

export const SharifAvatarSvg: React.FC<AthleteAvatarProps> = ({
  name = 'Sharif',
  avatarUrl = '',
  className = 'w-10 h-10',
  editable = false,
  onEdit,
  showBadge = false,
}) => {
  const [imageError, setImageError] = React.useState(false);
  const initial = (name || 'S').charAt(0).toUpperCase();

  // Reset error if avatarUrl changes
  React.useEffect(() => {
    setImageError(false);
  }, [avatarUrl]);

  const hasCustomImage = Boolean(avatarUrl && !imageError);

  const avatarContent = (
    <div className={`relative ${className} rounded-full shrink-0 select-none`}>
      {hasCustomImage ? (
        <img
          src={avatarUrl}
          alt={`${name} profile avatar`}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover rounded-full border border-slate-200 dark:border-slate-800"
        />
      ) : (
        <svg
          viewBox="0 0 64 64"
          className="w-full h-full rounded-full"
          role="img"
          aria-label={`${name} profile avatar`}
        >
          <circle cx="32" cy="32" r="32" fill="#F43F5E" />
          <circle cx="32" cy="24" r="10" fill="#FFF1F2" opacity="0.92" />
          <path d="M16 54 C16 42 48 42 48 54" fill="#FFF1F2" opacity="0.92" />
          <text
            x="32"
            y="28"
            textAnchor="middle"
            fill="#881337"
            fontSize="12"
            fontWeight="700"
            fontFamily="Poppins, sans-serif"
          >
            {initial}
          </text>
        </svg>
      )}

      {(editable || onEdit || showBadge) && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.();
          }}
          title="Change profile picture"
          aria-label="Change profile picture"
          className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-neutral-900 text-white hover:bg-rose-600 flex items-center justify-center border border-white dark:border-neutral-900 transition-colors cursor-pointer"
        >
          <Camera className="w-2.5 h-2.5" />
        </button>
      )}
    </div>
  );

  if (onEdit && !editable) {
    return (
      <div
        onClick={onEdit}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onEdit();
          }
        }}
        title="Click to change profile picture"
        aria-label="Change profile picture"
        className="relative group cursor-pointer inline-flex rounded-full focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
      >
        {avatarContent}
        <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition-opacity text-white text-xs font-semibold">
          <Camera className="w-3.5 h-3.5" />
          <span>Edit</span>
        </div>
      </div>
    );
  }

  return avatarContent;
};
