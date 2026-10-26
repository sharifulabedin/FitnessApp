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

    // Solid Deep Slate Ground
    ctx.fillStyle = '#0B0F19';
    ctx.fillRect(0, 0, 1080, 1350);

    // Outer Border Frame (Hairline)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    ctx.strokeRect(60, 60, 960, 1230);

    // App Branding Overline
    ctx.font = '600 24px Poppins, sans-serif';
    ctx.fillStyle = '#FB7185';
    ctx.fillText('MORNING 20 · 3-1-1 TEMPO PROTOCOL', 110, 140);

    // Main Title
    ctx.font = '700 64px Poppins, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('Workout Completed.', 110, 220);

    // Subtitle Athlete & Date
    ctx.font = '400 28px Poppins, sans-serif';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText(`Athlete: ${profile.name} · ${todayDateLabel}`, 110, 275);

    // Streak Highlight Box (Clean Hairline Box)
    ctx.fillStyle = 'rgba(244, 63, 94, 0.08)';
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(110, 330, 860, 220, 16);
    ctx.fill();
    ctx.stroke();

    ctx.font = '700 96px Poppins, sans-serif';
    ctx.fillStyle = '#F43F5E';
    ctx.fillText(`${activeStreak}`, 160, 475);

    ctx.font = '600 32px Poppins, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('DAYS UNBROKEN STREAK', 350, 420);

    ctx.font = '400 26px Poppins, sans-serif';
    ctx.fillStyle = '#FDA4AF';
    ctx.fillText('30-Day Hypertrophy Consistency', 350, 470);

    // Two-Column Metrics Row
    // Left Box: Session Elapsed Time
    ctx.fillStyle = 'rgba(30, 41, 59, 0.6)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(110, 580, 415, 220, 16);
    ctx.fill();
    ctx.stroke();

    ctx.font = '500 22px Poppins, sans-serif';
    ctx.fillStyle = '#38BDF8';
    ctx.fillText('SESSION TIME', 150, 640);

    ctx.font = '600 56px Poppins, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(mmSs, 150, 735);

    // Right Box: 30-Day Total Logged
    ctx.beginPath();
    ctx.roundRect(555, 580, 415, 220, 16);
    ctx.fill();
    ctx.stroke();

    ctx.font = '500 22px Poppins, sans-serif';
    ctx.fillStyle = '#34D399';
    ctx.fillText('30-DAY PROGRESS', 595, 640);

    ctx.font = '600 56px Poppins, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`${totalCompleted} / 30`, 595, 735);

    // Post-Workout Protein Window Box
    ctx.fillStyle = 'rgba(245, 158, 11, 0.08)';
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(110, 830, 860, 160, 16);
    ctx.fill();
    ctx.stroke();

    ctx.font = '600 28px Poppins, sans-serif';
    ctx.fillStyle = '#FBBF24';
    ctx.fillText('POST-WORKOUT PROTEIN WINDOW', 150, 895);

    ctx.font = '400 24px Poppins, sans-serif';
    ctx.fillStyle = '#E2E8F0';
    ctx.fillText(`Target: ${postWorkoutProteinGrams}g high-quality protein within 45 minutes`, 150, 945);

    // Footer Watermark Branding
    ctx.font = '400 24px Poppins, sans-serif';
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
      className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-card-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-slate-900 text-white border border-slate-800 rounded-2xl p-6 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 id="share-card-title" className="text-base font-semibold tracking-tight">
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
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Visual Preview Graphic Card */}
        <div
          ref={cardRef}
          className="mt-5 p-5 rounded-xl bg-slate-950 border border-slate-800 relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between text-xs text-rose-400 font-medium tracking-wide">
              <span>MORNING 20 · 3-1-1 TEMPO</span>
              <span className="text-slate-400">{todayDateLabel}</span>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-white">
                  Workout Completed
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Athlete: <strong className="text-slate-200">{profile.name}</strong>
                </p>
              </div>

              <div className="px-3 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 font-semibold tabular-nums text-sm flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-rose-500" />
                <span>{activeStreak} Days</span>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-1.5 text-xs text-sky-400 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Session Time</span>
                </div>
                <div className="tabular-nums text-xl font-semibold text-white mt-1">
                  {mmSs}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>30-Day Total</span>
                </div>
                <div className="tabular-nums text-xl font-semibold text-white mt-1">
                  {totalCompleted} / 30
                </div>
              </div>
            </div>

            <div className="mt-3 p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-amber-300 font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Post-Workout Refuel
              </span>
              <span className="tabular-nums font-semibold text-white">
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
            className="h-10 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors border border-slate-700"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Copied to Clipboard</span>
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
            className="h-10 px-4 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download Story Card</span>
          </button>
        </div>
      </div>
    </div>
  );
};
