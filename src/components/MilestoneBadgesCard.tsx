import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Flame,
  Zap,
  Shield,
  Award,
  Sparkles,
  Target,
  CheckCircle2,
  X,
} from 'lucide-react';
import { MilestoneBadge } from '../utils/fitnessLogic';

interface Props {
  badges: MilestoneBadge[];
  onOpenShareModal?: () => void;
  darkMode?: boolean;
}

export const MilestoneBadgesCard: React.FC<Props> = ({
  badges,
  onOpenShareModal,
}) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'streak' | 'circuit'>('all');
  const [selectedBadge, setSelectedBadge] = useState<MilestoneBadge | null>(null);

  const unlockedCount = badges.filter((b) => b.isUnlocked).length;
  const completionPercent = Math.round((unlockedCount / badges.length) * 100);

  // Handle Escape key for detail modal
  useEffect(() => {
    if (!selectedBadge) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedBadge(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBadge]);

  const filteredBadges = badges.filter((b) => {
    if (filter === 'unlocked') return b.isUnlocked;
    if (filter === 'streak') return b.category === 'streak';
    if (filter === 'circuit') return b.category === 'circuit' || b.category === 'mobility';
    return true;
  });

  const renderIcon = (iconName: MilestoneBadge['icon'], isUnlocked: boolean) => {
    const iconClass = `w-5 h-5 ${isUnlocked ? 'text-amber-500 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500'}`;
    switch (iconName) {
      case 'flame':
        return <Flame className={iconClass} />;
      case 'zap':
        return <Zap className={iconClass} />;
      case 'shield':
        return <Shield className={iconClass} />;
      case 'trophy':
        return <Trophy className={iconClass} />;
      case 'target':
        return <Target className={iconClass} />;
      case 'sparkles':
        return <Sparkles className={iconClass} />;
      case 'award':
      default:
        return <Award className={iconClass} />;
    }
  };

  const getTierBadge = (tier: MilestoneBadge['tier']) => {
    switch (tier) {
      case 'diamond':
        return (
          <span className="text-[10px] font-mono uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-950/70 dark:text-cyan-300 border border-cyan-300/60 shadow-2xs">
            Diamond
          </span>
        );
      case 'gold':
        return (
          <span className="text-[10px] font-mono uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300/60 shadow-2xs">
            Gold
          </span>
        );
      case 'silver':
        return (
          <span className="text-[10px] font-mono uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-300/60 shadow-2xs">
            Silver
          </span>
        );
      case 'bronze':
      default:
        return (
          <span className="text-[10px] font-mono uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 dark:bg-orange-950/70 dark:text-orange-300 border border-orange-300/60 shadow-2xs">
            Bronze
          </span>
        );
    }
  };

  return (
    <div
      data-testid="milestone-badges-card"
      className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 transition-all bento-card-tactile"
    >
      {/* Header with Title and Global Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-500 dark:text-amber-400 font-semibold tracking-wider">
            <Trophy className="w-3.5 h-3.5" />
            <span>GAMIFICATION &amp; STREAK MOTIVATION</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-2">
            <span>Milestone Achievements &amp; Trophies</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 font-mono font-medium">
              {unlockedCount} / {badges.length} Unlocked
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Unlock tiered trophies by conquering daily 3-1-1 circuits, extending your active streak, and deploying streak shields.
          </p>
        </div>

        {/* Global Trophy Progress Bar */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-mono tabular-nums">
              {completionPercent}% Conquered
            </div>
            <div className="w-32 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-rose-500 transition-all duration-500 rounded-full"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>

          {onOpenShareModal && (
            <button
              type="button"
              onClick={onOpenShareModal}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 tactile-button focus-ring-tactile shadow-xs"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />
              <span>Share Badges</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 text-xs font-medium text-slate-600 dark:text-slate-300">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`min-h-[38px] px-3.5 py-1.5 rounded-xl transition-all tactile-button focus-ring-tactile ${
            filter === 'all'
              ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold shadow-xs'
              : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700'
          }`}
        >
          All ({badges.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('unlocked')}
          className={`min-h-[38px] px-3.5 py-1.5 rounded-xl transition-all tactile-button focus-ring-tactile ${
            filter === 'unlocked'
              ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold shadow-xs'
              : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700'
          }`}
        >
          Unlocked ({unlockedCount})
        </button>
        <button
          type="button"
          onClick={() => setFilter('streak')}
          className={`min-h-[38px] px-3.5 py-1.5 rounded-xl transition-all tactile-button focus-ring-tactile ${
            filter === 'streak'
              ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold shadow-xs'
              : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700'
          }`}
        >
          Streak &amp; Shields
        </button>
        <button
          type="button"
          onClick={() => setFilter('circuit')}
          className={`min-h-[38px] px-3.5 py-1.5 rounded-xl transition-all tactile-button focus-ring-tactile ${
            filter === 'circuit'
              ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold shadow-xs'
              : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700'
          }`}
        >
          Circuit &amp; Mobility
        </button>
      </div>

      {/* Badges Grid with 3D Tactile Medal Styling */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {filteredBadges.map((badge) => {
          return (
            <div
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
              role="button"
              tabIndex={0}
              aria-label={`Milestone: ${badge.title}. ${badge.isUnlocked ? 'Unlocked' : `In progress: ${badge.progress}%`}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedBadge(badge);
                }
              }}
              className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between cursor-pointer group focus-ring-tactile ${
                badge.isUnlocked
                  ? 'bg-gradient-to-b from-amber-50/60 via-white to-amber-50/20 dark:from-amber-950/30 dark:via-slate-800 dark:to-slate-900 border-amber-300/80 dark:border-amber-600/50 hover:border-amber-400 hover:shadow-md'
                  : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-75 hover:opacity-100 hover:border-slate-300 dark:hover:border-slate-700 shadow-inner'
              }`}
            >
              <div>
                {/* Top Row: Icon + Tier */}
                <div className="flex items-center justify-between">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-xs ${
                      badge.isUnlocked
                        ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 border border-amber-300/60 dark:border-amber-600/40'
                        : 'bg-slate-200/70 dark:bg-slate-800 text-slate-400 border border-slate-300/50 dark:border-slate-700/60'
                    }`}
                  >
                    {renderIcon(badge.icon, badge.isUnlocked)}
                  </div>
                  {getTierBadge(badge.tier)}
                </div>

                <div className="mt-3">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>{badge.title}</span>
                    {badge.isUnlocked && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    )}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {badge.description}
                  </p>
                </div>
              </div>

              {/* Bottom Progress Bar */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1">
                  <span>{badge.progressLabel}</span>
                  <span className={badge.isUnlocked ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}>
                    {badge.isUnlocked ? 'UNLOCKED' : `${badge.progress}%`}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      badge.isUnlocked ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                    style={{ width: `${badge.progress}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Badge Detail Modal */}
      {selectedBadge && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-labelledby="badge-detail-title"
          onClick={() => setSelectedBadge(null)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl bento-card-tactile"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 flex items-center justify-center border border-amber-300/60 dark:border-amber-600/40 shadow-xs">
                  {renderIcon(selectedBadge.icon, selectedBadge.isUnlocked)}
                </div>
                <div>
                  <h4 id="badge-detail-title" className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedBadge.title}
                  </h4>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {selectedBadge.category.toUpperCase()} · {selectedBadge.tier.toUpperCase()} TIER
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBadge(null)}
                aria-label="Close badge details"
                className="min-h-[44px] min-w-[44px] rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors focus-ring-tactile"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700 shadow-2xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Requirement:</span>
                <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                  {selectedBadge.unlockedRequirement}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700 shadow-2xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Status:</span>
                <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                  {selectedBadge.isUnlocked
                    ? '🏆 Unlocked! Trophy awarded to your athlete showcase.'
                    : `In Progress · ${selectedBadge.progressLabel} (${selectedBadge.progress}%)`}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedBadge(null)}
              className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-semibold text-xs transition-colors tactile-button focus-ring-tactile"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
