import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Download,
  Flame,
  Clock,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { UserProfile, formatElapsedMmSs, generateWorkoutShareText } from '../utils/fitnessLogic';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  activeStreak: number;
  totalCompleted: number;
  sessionElapsedSeconds: number;
  postWorkoutProteinGrams: number;
  todayDateLabel: string;
}

export const WorkoutShareCardModal: React.FC<Props> = ({
  isOpen,
  onClose,
  profile,
  activeStreak,
  totalCompleted,
  sessionElapsedSeconds,
  postWorkoutProteinGrams,
  todayDateLabel,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

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

  const mmSs = formatElapsedMmSs(sessionElapsedSeconds);
  const shareText = generateWorkoutShareText({
    athleteName: profile.name,
    activeStreak,
    totalCompleted,
    sessionElapsedSeconds,
    dateLabel: todayDateLabel,
    proteinGrams: postWorkoutProteinGrams,
  });

  const handleCopyText = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2400);
      }
    } catch {
      // ignore
    }
  };

  const handleDownloadCanvasImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background Gradient (Deep Carbon Slate)
    const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1350);
    bgGrad.addColorStop(0, '#0F172A');
    bgGrad.addColorStop(0.5, '#0B0F19');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1350);

    // Decorative Ambient Glowing Spheres
    const glow1 = ctx.createRadialGradient(250, 200, 20, 250, 200, 400);
    glow1.addColorStop(0, 'rgba(244, 63, 94, 0.28)');
    glow1.addColorStop(1, 'rgba(244, 63, 94, 0)');
    ctx.fillStyle = glow1;
    ctx.fillRect(0, 0, 1080, 1350);

    const glow2 = ctx.createRadialGradient(850, 1100, 20, 850, 1100, 450);
    glow2.addColorStop(0, 'rgba(16, 185, 129, 0.25)');
    glow2.addColorStop(1, 'rgba(16, 185, 129, 0)');
    ctx.fillStyle = glow2;
    ctx.fillRect(0, 0, 1080, 1350);

    // Outer Border Frame
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 4;
    ctx.strokeRect(60, 60, 960, 1230);

    // App Branding Overline
    ctx.font = '600 28px Poppins, sans-serif';
    ctx.fillStyle = '#FB7185';
    ctx.fillText('MORNING 20 · 3-1-1 TEMPO PROTOCOL', 110, 140);

    // Main Trophy Title
    ctx.font = '800 68px Poppins, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('Workout Crushed.', 110, 220);

    // Subtitle Athlete & Date
    ctx.font = '400 32px Poppins, sans-serif';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText(`Athlete: ${profile.name} · ${todayDateLabel}`, 110, 275);

    // Streak Highlight Box (Tactile Pill)
    ctx.fillStyle = 'rgba(244, 63, 94, 0.18)';
    ctx.strokeStyle = '#F43F5E';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(110, 330, 860, 220, 32);
    ctx.fill();
    ctx.stroke();

    ctx.font = '800 108px Poppins, sans-serif';
    ctx.fillStyle = '#F43F5E';
    ctx.fillText(`${activeStreak}`, 160, 475);

    ctx.font = '700 36px Poppins, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('DAYS UNBROKEN STREAK', 350, 420);

    ctx.font = '400 28px Poppins, sans-serif';
    ctx.fillStyle = '#FDA4AF';
    ctx.fillText('30-Day Hypertrophy Consistency', 350, 470);

    // Two-Column Metrics Row
    // Left Box: Session Elapsed Time
    ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(110, 580, 415, 220, 28);
    ctx.fill();
    ctx.stroke();

    ctx.font = '600 26px Poppins, sans-serif';
    ctx.fillStyle = '#38BDF8';
    ctx.fillText('SESSION TIME', 150, 640);

    ctx.font = '700 64px JetBrains Mono, monospace';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(mmSs, 150, 735);

    // Right Box: 30-Day Total Logged
    ctx.beginPath();
    ctx.roundRect(555, 580, 415, 220, 28);
    ctx.fill();
    ctx.stroke();

    ctx.font = '600 26px Poppins, sans-serif';
    ctx.fillStyle = '#34D399';
    ctx.fillText('30-DAY PROGRESS', 595, 640);

    ctx.font = '700 64px JetBrains Mono, monospace';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`${totalCompleted} / 30`, 595, 735);

    // Post-Workout Protein Window Box
    ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(110, 830, 860, 160, 28);
    ctx.fill();
    ctx.stroke();

    ctx.font = '700 32px Poppins, sans-serif';
    ctx.fillStyle = '#FBBF24';
    ctx.fillText('POST-WORKOUT PROTEIN WINDOW', 150, 895);

    ctx.font = '400 26px Poppins, sans-serif';
    ctx.fillStyle = '#E2E8F0';
    ctx.fillText(`Target: ${postWorkoutProteinGrams}g high-quality protein within 45 minutes`, 150, 945);

    // Footer Watermark Branding
    ctx.font = '500 26px Poppins, sans-serif';
    ctx.fillStyle = '#64748B';
    ctx.fillText('Morning 20 · 20-Min Daily Bodyweight Hypertrophy', 110, 1220);

    // Download Trigger
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `morning20-streak-day${activeStreak}-${profile.name.toLowerCase()}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-card-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-slate-900 text-white border border-slate-800 rounded-3xl p-6 shadow-2xl my-auto bento-card-tactile"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center shadow-xs">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 id="share-card-title" className="text-lg font-bold tracking-tight">
                Share Workout Progress
              </h2>
              <p className="text-xs text-slate-400">
                Generate high-res 1080x1350 story cards or copy summary text
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close share modal"
            className="min-h-[44px] min-w-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors tactile-button focus-ring-tactile"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visual Preview Graphic Card */}
        <div
          ref={cardRef}
          className="mt-5 p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 shadow-xl relative overflow-hidden bento-card-tactile"
        >
          {/* Ambient Glows */}
          <div className="absolute -top-16 -left-16 w-44 h-44 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-44 h-44 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center justify-between text-xs font-mono text-rose-400 font-semibold tracking-wider">
              <span>MORNING 20 · 3-1-1 TEMPO</span>
              <span className="text-slate-400">{todayDateLabel}</span>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold tracking-tight text-white">
                  Workout Crushed!
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Athlete: <strong className="text-slate-200">{profile.name}</strong>
                </p>
              </div>

              <div className="px-3.5 py-1.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 font-bold font-mono text-lg flex items-center gap-1.5 shadow-xs">
                <Flame className="w-5 h-5 text-rose-500 animate-pulse" />
                <span>{activeStreak} Days</span>
              </div>
            </div>

            {/* Metrics Bento Row */}
            <div className="grid grid-cols-2 gap-3 mt-5">
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-inner">
                <div className="flex items-center gap-1.5 text-xs text-sky-400 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Session Time</span>
                </div>
                <div className="font-mono tabular-nums text-2xl font-bold text-white mt-1">
                  {mmSs}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-inner">
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>30-Day Total</span>
                </div>
                <div className="font-mono tabular-nums text-2xl font-bold text-white mt-1">
                  {totalCompleted} / 30
                </div>
              </div>
            </div>

            <div className="mt-3.5 p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between text-xs shadow-2xs">
              <span className="text-amber-300 font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Post-Workout Refuel
              </span>
              <span className="font-mono font-bold text-white">
                {postWorkoutProteinGrams}g Protein
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleCopyText}
            className="min-h-[46px] px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors border border-slate-700 tactile-button focus-ring-tactile"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-300" />
                <span>Copy Summary Text</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadCanvasImage}
            className="min-h-[46px] px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-md shadow-rose-500/20 tactile-button focus-ring-tactile"
          >
            <Download className="w-4 h-4" />
            <span>Download PNG Story Card</span>
          </button>
        </div>
      </div>
    </div>
  );
};
