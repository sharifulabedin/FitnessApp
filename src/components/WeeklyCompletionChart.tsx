import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ReferenceLine,
} from 'recharts';
import { Clock } from 'lucide-react';
import { CalendarDay, getLast7DaysCompletionData, WeeklyProgressPoint } from '../utils/fitnessLogic';

interface Props {
  calendarDays: CalendarDay[];
  onToggleDay: (dayNumber: number) => void;
  onOpenLogDuration?: (dayNumber: number) => void;
  darkMode?: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: WeeklyProgressPoint }>;
  chartMode?: 'consistency' | 'duration';
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, chartMode = 'consistency' }) => {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0].payload;

  return (
    <div className="rounded-2xl bg-slate-900/95 text-white px-4 py-3 shadow-2xl border border-slate-700/80 text-xs backdrop-blur-md">
      <div className="font-semibold flex items-center justify-between gap-3">
        <span>Day {item.dayNumber} · {item.dateLabel} ({item.dayShort})</span>
        {item.durationSeconds ? (
          <span className="text-emerald-400 font-mono font-bold">
            {item.formattedDuration}
          </span>
        ) : null}
      </div>
      <div className="text-slate-300 mt-1 font-mono tabular-nums">
        {item.statusLabel}
      </div>
      {chartMode === 'duration' && item.minutesLogged > 0 && (
        <div className="text-[11px] text-slate-400 mt-1">
          {item.minutesLogged <= 20
            ? `✓ Within 20m target window (${Math.round((20 - item.minutesLogged) * 10) / 10}m under)`
            : `Over 20m target by ${Math.round((item.minutesLogged - 20) * 10) / 10}m`}
        </div>
      )}
      <div className="text-[10px] text-amber-300 mt-1 font-medium">
        Click bar to toggle session status / log duration
      </div>
    </div>
  );
};

export const WeeklyCompletionChart: React.FC<Props> = ({
  calendarDays,
  onToggleDay,
  onOpenLogDuration,
  darkMode = false,
}) => {
  const [chartMode, setChartMode] = useState<'consistency' | 'duration'>('consistency');
  const { points, completedInLast7, weeklyConsistencyPercent } =
    getLast7DaysCompletionData(calendarDays);

  const getBarFill = (entry: WeeklyProgressPoint): string => {
    if (chartMode === 'duration') {
      if (!entry.completed) return darkMode ? '#334155' : '#E2E8F0';
      if (entry.minutesLogged <= 20) return '#10B981'; // optimal pace: emerald
      return '#38BDF8'; // slightly longer: sky
    }
    if (entry.completed) return '#10B981'; // Emerald 500
    if (entry.isToday) return '#F43F5E'; // Rose 500
    if (entry.isRecoveryDay) return '#F59E0B'; // Amber 500
    return darkMode ? '#334155' : '#CBD5E1';
  };

  return (
    <div
      data-testid="weekly-completion-progress"
      className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800"
    >
      {/* Header & Overall 7-Day Progress Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Last 7 Days Progress &amp; Pace
            </h2>
            {/* View Mode Toggle Pill */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold border border-slate-200/60 dark:border-slate-700 shadow-inner">
              <button
                type="button"
                onClick={() => setChartMode('consistency')}
                className={`min-h-[30px] px-2.5 py-1 rounded-lg transition-all tactile-button ${
                  chartMode === 'consistency'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                Consistency %
              </button>
              <button
                type="button"
                onClick={() => setChartMode('duration')}
                className={`min-h-[30px] px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 tactile-button ${
                  chartMode === 'duration'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Clock className="w-3 h-3" />
                <span>Duration (Min)</span>
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {chartMode === 'consistency'
              ? `Weekly hypertrophy consistency (${points[0]?.dateLabel} – ${points[points.length - 1]?.dateLabel}) · Click any bar to toggle`
              : 'Workout session duration tracked in minutes (Target: ≤ 20 min efficiency)'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono tabular-nums text-xs font-semibold text-slate-700 dark:text-slate-300">
            {completedInLast7}/7 Sessions ({weeklyConsistencyPercent}%)
          </span>
          <div
            className="w-28 sm:w-36 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner"
            role="progressbar"
            aria-valuenow={weeklyConsistencyPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Weekly completion consistency percentage"
          >
            <div
              className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
              style={{ width: `${weeklyConsistencyPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Recharts 7-Day Consistency / Duration Bar Chart */}
      <div className="h-44 w-full bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800 bento-tile-tactile">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={points}
            margin={{ top: 8, right: 10, left: -24, bottom: 0 }}
            barCategoryGap="20%"
          >
            <XAxis
              dataKey="dayShort"
              interval={0}
              axisLine={false}
              tickLine={false}
              tick={{
                fill: darkMode ? '#94A3B8' : '#475569',
                fontSize: 11,
                fontFamily: 'Poppins, sans-serif',
              }}
            />
            {chartMode === 'consistency' ? (
              <YAxis
                domain={[0, 100]}
                ticks={[0, 50, 100]}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `${val}%`}
                tick={{
                  fill: darkMode ? '#64748B' : '#94A3B8',
                  fontSize: 10,
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              />
            ) : (
              <YAxis
                domain={[0, 30]}
                ticks={[0, 10, 20, 30]}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `${val}m`}
                tick={{
                  fill: darkMode ? '#64748B' : '#94A3B8',
                  fontSize: 10,
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              />
            )}
            <Tooltip
              content={<CustomTooltip chartMode={chartMode} />}
              cursor={{ fill: 'rgba(148, 163, 184, 0.12)', radius: 8 }}
            />
            {chartMode === 'duration' && (
              <ReferenceLine
                y={20}
                stroke="#10B981"
                strokeDasharray="3 3"
                label={{
                  value: '20m Goal',
                  position: 'top',
                  fill: '#10B981',
                  fontSize: 10,
                  fontFamily: 'Poppins, sans-serif',
                }}
              />
            )}
            <Bar
              dataKey={chartMode === 'consistency' ? 'barValue' : 'minutesLogged'}
              radius={[8, 8, 8, 8]}
              maxBarSize={38}
              onClick={(data) => {
                const payload = (data as unknown as { payload?: WeeklyProgressPoint })?.payload;
                if (payload && typeof payload.dayNumber === 'number') {
                  if (chartMode === 'duration' && onOpenLogDuration) {
                    onOpenLogDuration(payload.dayNumber);
                  } else {
                    onToggleDay(payload.dayNumber);
                  }
                }
              }}
              className="cursor-pointer"
            >
              {points.map((entry) => (
                <Cell
                  key={`cell-${entry.dayNumber}`}
                  fill={getBarFill(entry)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex flex-wrap items-center gap-4">
          {chartMode === 'consistency' ? (
            <>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
                <span>Completed</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-rose-500" />
                <span>Today (Pending)</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-amber-500" />
                <span>Active Recovery Day</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-slate-300 dark:bg-slate-700" />
                <span>Unlogged</span>
              </span>
            </>
          ) : (
            <>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
                <span>≤ 20m Target Efficiency</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-sky-400" />
                <span>&gt; 20m Duration</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-slate-300 dark:bg-slate-700" />
                <span>Unlogged Day (0m)</span>
              </span>
            </>
          )}
        </div>
        <span className="font-mono tabular-nums">
          {chartMode === 'consistency'
            ? 'Target: 6 Training + 1 Recovery / Week'
            : 'Click any bar to log or adjust duration'}
        </span>
      </div>
    </div>
  );
};
