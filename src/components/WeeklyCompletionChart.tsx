import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { CalendarDay, getLast7DaysCompletionData, WeeklyProgressPoint } from '../utils/fitnessLogic';

interface Props {
  calendarDays: CalendarDay[];
  onToggleDay: (dayNumber: number) => void;
  darkMode?: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: WeeklyProgressPoint }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0].payload;

  return (
    <div className="rounded-xl bg-slate-900 text-white px-3.5 py-2.5 shadow-lg border border-slate-700 text-xs">
      <div className="font-semibold">
        Day {item.dayNumber} · {item.dateLabel} ({item.dayShort})
      </div>
      <div className="text-slate-300 mt-0.5 font-mono tabular-nums">
        {item.statusLabel}
      </div>
      <div className="text-[10px] text-amber-300 mt-1">
        Click bar to toggle session status
      </div>
    </div>
  );
};

export const WeeklyCompletionChart: React.FC<Props> = ({
  calendarDays,
  onToggleDay,
  darkMode = false,
}) => {
  const { points, completedInLast7, weeklyConsistencyPercent } =
    getLast7DaysCompletionData(calendarDays);

  const getBarFill = (entry: WeeklyProgressPoint): string => {
    if (entry.completed) return '#10B981'; // Emerald 500
    if (entry.isToday) return '#F43F5E'; // Rose 500
    if (entry.isRecoveryDay) return '#F59E0B'; // Amber 500
    return darkMode ? '#334155' : '#CBD5E1';
  };

  return (
    <div
      data-testid="weekly-completion-progress"
      className="mt-5 pt-5 border-t border-slate-100"
    >
      {/* Header & Overall 7-Day Progress Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Last 7 Days Completion Progress
          </h2>
          <p className="text-xs text-slate-500">
            Weekly hypertrophy consistency ({points[0]?.dateLabel} – {points[points.length - 1]?.dateLabel}) · Click any day bar to toggle
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono tabular-nums text-xs font-semibold text-slate-700">
            {completedInLast7}/7 Sessions ({weeklyConsistencyPercent}%)
          </span>
          <div
            className="w-28 sm:w-36 h-2.5 bg-slate-100 rounded-full overflow-hidden"
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

      {/* Recharts 7-Day Consistency Bar Chart */}
      <div className="h-44 w-full bg-slate-50/70 rounded-2xl p-3 border border-slate-100">
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
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(148, 163, 184, 0.12)', radius: 8 }}
            />
            <Bar
              dataKey="barValue"
              radius={[8, 8, 8, 8]}
              maxBarSize={38}
              onClick={(data) => {
                const payload = (data as unknown as { payload?: WeeklyProgressPoint })?.payload;
                if (payload && typeof payload.dayNumber === 'number') {
                  onToggleDay(payload.dayNumber);
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
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
            <span>Completed (20m)</span>
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
            <span className="w-2.5 h-2.5 rounded-xs bg-slate-300" />
            <span>Unlogged</span>
          </span>
        </div>
        <span className="font-mono tabular-nums">Target: 6 Training + 1 Recovery / Week</span>
      </div>
    </div>
  );
};
