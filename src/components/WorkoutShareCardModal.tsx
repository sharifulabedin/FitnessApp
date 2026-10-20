import React, { useState, useRef } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Download,
  Flame,
  Clock,
  Sparkles,
  Dumbbell,
  Shield,
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
    ctx.font = '600 28px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = '#FB7185';
    ctx.fillText('MORNING 20 · 3-1-1 HYPERTROPHY PROTOCOL', 110, 150);

    // Title Headline
    ctx.font = 'bold 64px Outfit, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('WORKOUT CRUSHED', 110, 240);

    // Subtitle Athlete & Date
    ctx.font = '500 32px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText(`Athlete: ${profile.name} · ${todayDateLabel}, 2026`, 110, 300);

    // Draw Stats Bento Cards
    const drawCard = (x: number, y: number, w: number, h: number, fill: string) => {
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 28);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    // Card 1: Active Streak (Big Fire Hero)
    drawCard(110, 360, 860, 230, 'rgba(30, 41, 59, 0.7)');
    ctx.font = '600 26px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = '#F43F5E';
    ctx.fillText('ACTIVE STREAK CONSISTENCY', 160, 420);

    ctx.font = 'bold 96px JetBrains Mono, monospace';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`${activeStreak} DAYS 🔥`, 160, 525);

    // Card 2: Session Time
    drawCard(110, 620, 410, 210, 'rgba(30, 41, 59, 0.7)');
    ctx.font = '600 24px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = '#38BDF8';
    ctx.fillText('SESSION TIME', 150, 680);
    ctx.font = 'bold 72px JetBrains Mono, monospace';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(mmSs, 150, 770);

    // Card 3: 30-Day Completion
    drawCard(560, 620, 410, 210, 'rgba(30, 41, 59, 0.7)');
    ctx.font = '600 24px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = '#34D399';
    ctx.fillText('CALENDAR PROGRESS', 600, 680);
    ctx.font = 'bold 72px JetBrains Mono, monospace';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`${totalCompleted} / 30`, 600, 770);

    // Card 4: Post-Workout Fuel Target
    drawCard(110, 860, 860, 200, 'rgba(30, 41, 59, 0.7)');
    ctx.font = '600 24px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = '#F59E0B';
    ctx.fillText('POST-WORKOUT REFUEL WINDOW (+45 MINS)', 160, 920);
    ctx.font = 'bold 56px Outfit, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`${postWorkoutProteinGrams}g High-Protein Target · Glycogen Refuel`, 160, 995);

    // Bottom Footer Watermark
    ctx.font = '500 26px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = '#64748B';
    ctx.fillText('No Equipment Required · Bed-Edge Pull-Ups & 3-1-1 Tempo Mastery', 110, 1190);
    ctx.fillText('Built with Morning 20 AI Fitness Studio', 110, 1235);

    // Trigger download
    const link = document.createElement('a');
    link.download = `morning20-${profile.name.toLowerCase().replace(/\s+/g, '-')}-streak-${activeStreak}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-card-modal-title"
    >
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-2xl my-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 id="share-card-modal-title" className="text-lg font-bold text-white">
                Share Workout Achievement
              </h2>
              <p className="text-xs text-slate-400">
                Story-ready visual card &amp; quick summary for social or accountability partners
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close share modal"
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Visual Preview Graphic Card */}
        <div
          ref={cardRef}
          className="mt-5 p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 shadow-xl relative overflow-hidden"
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

              <div className="px-3.5 py-1.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 font-bold font-mono text-lg flex items-center gap-1.5">
                <Flame className="w-5 h-5 text-rose-500 animate-pulse" />
                <span>{activeStreak} Days</span>
              </div>
            </div>

            {/* Metrics Bento Row */}
            <div className="grid grid-cols-2 gap-3 mt-5">
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60">
                <div className="flex items-center gap-1.5 text-xs text-sky-400 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Session Time</span>
                </div>
                <div className="font-mono tabular-nums text-2xl font-bold text-white mt-1">
                  {mmSs}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60">
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>30-Day Total</span>
                </div>
                <div className="font-mono tabular-nums text-2xl font-bold text-white mt-1">
                  {totalCompleted} / 30
                </div>
              </div>
            </div>

            <div className="mt-3.5 p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between text-xs">
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
            className="min-h-[46px] px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors border border-slate-700"
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
            className="min-h-[46px] px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-md shadow-rose-500/20"
          >
            <Download className="w-4 h-4" />
            <span>Download PNG Story Card</span>
          </button>
        </div>
      </div>
    </div>
  );
};
