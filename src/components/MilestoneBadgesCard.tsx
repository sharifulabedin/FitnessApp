import React, { useState } from 'react';
import {
  Trophy,
  Flame,
  Zap,
  Shield,
  Award,
  Sparkles,
  Target,
  CheckCircle2,
  Lock,
  ChevronRight,
  Info,
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
  darkMode,
}) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'streak' | 'circuit'>('all');
  const [selectedBadge, setSelectedBadge] = useState<MilestoneBadge | null>(null);

  const unlockedCount = badges.filter((b) => b.isUnlocked).length;
  const completionPercent = Math.round((unlockedCount / badges.length) * 100);

  const filteredBadges = badges.filter((b) => {
    if (filter === 'unlocked') return b.isUnlocked;
    if (filter === 'streak') return b.category === 'streak';
    if (filter === 'circuit') return b.category === 'circuit' || b.category === 'mobility';
    return true;
  });

  const renderIcon = (iconName: MilestoneBadge['icon'], isUnlocked: boolean) => {
    const iconClass = `w-5 h-5 ${isUnlocked ? 'text-amber-400' : 'text-slate-400'}`;
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
          <span className="text-[10px] font-mono uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300 border border-cyan-300/40">
            Diamond
          </span>
        );
      case 'gold':
        return (
          <span className="text-[10px] font-mono uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/40">
            Gold
          </span>
        );
      case 'silver':
        return (
          <span className="text-[10px] font-mono uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-300/40">
            Silver
          </span>
        );
      case 'bronze':
      default:
        return (
          <span className="text-[10px] font-mono uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-300/40">
            Bronze
          </span>
        );
    }
  };

  return (
    <div
      data-testid="milestone-badges-card"
      className="bg-white border border-slate-200 rounded-3xl p-6 transition-all"
    >
      {/* Header with Title and Global Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-500 font-semibold tracking-wider">
            <Trophy className="w-3.5 h-3.5" />
            <span>GAMIFICATION &amp; STREAK MOTIVATION</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mt-0.5 flex items-center gap-2">
            <span>Milestone Achievements &amp; Trophies</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-mono font-medium">
              {unlockedCount} / {badges.length} Unlocked
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Unlock tiered trophies by conquering daily 3-1-1 circuits, extending your active streak, and deploying streak shields.
          </p>
        </div>

        {/* Global Trophy Progress Bar */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="text-xs font-semibold text-slate-700 font-mono tabular-nums">
              {completionPercent}% Conquered
            </div>
            <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden mt-1">
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
              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Share Badges</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 mt-4 overflow-x-auto pb-1 text-xs font-medium text-slate-600">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`min-h-[34px] px-3 py-1.5 rounded-xl transition-colors ${
            filter === 'all'
              ? 'bg-slate-900 text-white font-semibold'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
          }`}
        >
          All ({badges.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('unlocked')}
          className={`min-h-[34px] px-3 py-1.5 rounded-xl transition-colors ${
            filter === 'unlocked'
              ? 'bg-slate-900 text-white font-semibold'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
          }`}
        >
          Unlocked ({unlockedCount})
        </button>
        <button
          type="button"
          onClick={() => setFilter('streak')}
          className={`min-h-[34px] px-3 py-1.5 rounded-xl transition-colors ${
            filter === 'streak'
              ? 'bg-slate-900 text-white font-semibold'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
          }`}
        >
          Streak &amp; Shields
        </button>
        <button
          type="button"
          onClick={() => setFilter('circuit')}
          className={`min-h-[34px] px-3 py-1.5 rounded-xl transition-colors ${
            filter === 'circuit'
              ? 'bg-slate-900 text-white font-semibold'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
          }`}
        >
          Circuit &amp; Mobility
        </button>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {filteredBadges.map((badge) => {
          return (
            <div
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setSelectedBadge(badge);
                }
              }}
              className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between cursor-pointer group ${
                badge.isUnlocked
                  ? 'bg-gradient-to-b from-amber-50/40 to-white border-amber-200/90 hover:border-amber-400 hover:shadow-xs'
                  : 'bg-slate-50/60 border-slate-200 opacity-80 hover:opacity-100 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Top Row: Icon + Tier */}
                <div className="flex items-center justify-between">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                      badge.isUnlocked
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-200/70 text-slate-400'
                    }`}
                  >
                    {renderIcon(badge.icon, badge.isUnlocked)}
                  </div>
                  {getTierBadge(badge.tier)}
                </div>

                <div className="mt-3">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <span>{badge.title}</span>
                    {badge.isUnlocked && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    )}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {badge.description}
                  </p>
                </div>
              </div>

              {/* Bottom Progress Bar */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-1">
                  <span>{badge.progressLabel}</span>
                  <span className={badge.isUnlocked ? 'text-emerald-600 font-bold' : ''}>
                    {badge.isUnlocked ? 'UNLOCKED' : `${badge.progress}%`}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      badge.isUnlocked ? 'bg-amber-500' : 'bg-slate-300'
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
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                  {renderIcon(selectedBadge.icon, selectedBadge.isUnlocked)}
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedBadge.title}
                  </h4>
                  <div className="text-xs text-slate-500">
                    {selectedBadge.category.toUpperCase()} · {selectedBadge.tier.toUpperCase()} TIER
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBadge(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="my-4 space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 font-medium">Requirement:</span>
                <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                  {selectedBadge.unlockedRequirement}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 font-medium">Status:</span>
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
              className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
