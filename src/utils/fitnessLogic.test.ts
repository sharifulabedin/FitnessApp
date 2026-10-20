import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cmToFeetInches,
  feetInchesToCm,
  calculateDailyProteinTarget,
  buildPersonalizedWorkout,
  generateInitial30DayCalendar,
  calculateStreakStats,
  toggleCalendarDay,
  didCompleteCalendarDay,
  calculateTempoState,
  computePostWorkoutTime,
  generateCoachFallbackResponse,
  validateBackupPayload,
  resolveActiveSectionFromScroll,
  didJustCompleteFinalExercise,
  isPostWorkoutUnlocked,
  getLast7DaysCompletionData,
  calculateMobilityCompletion,
  DYNAMIC_MOBILITY_EXERCISES,
  formatElapsedMmSs,
  toggleDayShield,
  calculateMilestoneBadges,
  generateWorkoutShareText,
  DEFAULT_USER_PROFILE,
} from './fitnessLogic.ts';

test('height conversion between cm and feet/inches is accurate', () => {
  const { feet, inches } = cmToFeetInches(175);
  assert.equal(feet, 5);
  assert.equal(inches, 9);
  assert.equal(feetInchesToCm(5, 9), 175);
});

test('daily protein target scales with target hypertrophy weight', () => {
  const res = calculateDailyProteinTarget(66, 72);
  assert.equal(res.gramsPerDay, 144);
  assert.equal(res.postWorkoutGrams, 43);
  assert.equal(res.calorieSurplusKcal, 350);
});

test('personalized workout scales reps from push-up and pull-up baselines', () => {
  const exercises = buildPersonalizedWorkout({ maxPushUps: 5, maxPullUps: 3 });
  assert.equal(exercises.length, 6);
  assert.ok(exercises[1].prescribedReps.includes('Strict Reps'));
  assert.ok(exercises[3].prescribedReps.includes('Slow 4s Negatives'));
});

test('30-day calendar marks every 7th day as Active Recovery and calculates streaks', () => {
  const days = generateInitial30DayCalendar(12);
  assert.equal(days.length, 30);
  assert.equal(days[6].dayNumber, 7);
  assert.equal(days[6].isRecoveryDay, true);
  assert.equal(days[13].dayNumber, 14);
  assert.equal(days[13].isRecoveryDay, true);
  assert.equal(days[20].dayNumber, 21);
  assert.equal(days[20].isRecoveryDay, true);
  assert.equal(days[27].dayNumber, 28);
  assert.equal(days[27].isRecoveryDay, true);

  const initialStats = calculateStreakStats(days);
  assert.equal(initialStats.activeStreak, 4);
  assert.equal(initialStats.todayCompleted, false);

  const updatedDays = toggleCalendarDay(days, 12);
  const newStats = calculateStreakStats(updatedDays);
  assert.equal(newStats.activeStreak, 5);
  assert.equal(newStats.todayCompleted, true);
});

test('3-1-1 tempo state accurately tracks 3s eccentric, 1s pause, and 1s concentric', () => {
  const ecc = calculateTempoState(1500);
  assert.equal(ecc.phaseShort, 'LOWER 3s');
  assert.equal(ecc.repNumber, 1);
  assert.equal(ecc.phaseProgressPercent, 50);

  const hold = calculateTempoState(3500);
  assert.equal(hold.phaseShort, 'HOLD 1s');
  assert.equal(hold.bodyDepthFactor, 1);

  const drive = calculateTempoState(4500);
  assert.equal(drive.phaseShort, 'DRIVE 1s');
  assert.equal(drive.bodyDepthFactor, 0.5);

  const rep2 = calculateTempoState(5200);
  assert.equal(rep2.repNumber, 2);
  assert.equal(rep2.phaseShort, 'LOWER 3s');
});

test('post-workout protein notification time adds 45 minutes accurately', () => {
  const schedule = computePostWorkoutTime('07:00', 45);
  assert.equal(schedule.workoutTime12, '7:00 AM');
  assert.equal(schedule.proteinTime24, '07:45');
  assert.equal(schedule.proteinTime12, '7:45 AM');
});

test('fallback Gemini coach response includes personalized baseline and protein targets', () => {
  const reply = generateCoachFallbackResponse(
    'Give me a high-protein breakfast idea',
    DEFAULT_USER_PROFILE,
    5
  );
  assert.ok(reply.includes('144g protein'));
  assert.ok(reply.includes('Medjool dates'));
});

test('backup payload validator rejects malformed input and accepts valid 30-day state', () => {
  assert.equal(validateBackupPayload(null).valid, false);
  assert.equal(validateBackupPayload({ profile: {} }).valid, false);
  const validDays = generateInitial30DayCalendar(12);
  assert.equal(
    validateBackupPayload({ profile: DEFAULT_USER_PROFILE, calendarDays: validDays }).valid,
    true
  );
});

test('bottom nav scroll-spy resolves active section accurately', () => {
  const sections = [
    { id: 'overview' as const, top: 80 },
    { id: 'streak' as const, top: 420 },
    { id: 'prep' as const, top: 760 },
    { id: 'circuit' as const, top: 1180 },
  ];
  assert.equal(resolveActiveSectionFromScroll(0, sections, 180), 'overview');
  assert.equal(resolveActiveSectionFromScroll(300, sections, 180), 'streak');
  assert.equal(resolveActiveSectionFromScroll(620, sections, 180), 'prep');
  assert.equal(resolveActiveSectionFromScroll(1050, sections, 180), 'circuit');
});

test('didJustCompleteFinalExercise triggers only when transitioning to 100% completion', () => {
  assert.equal(
    didJustCompleteFinalExercise(['1', '2', '3', '4', '5'], ['1', '2', '3', '4', '5', '6'], 6),
    true
  );
  assert.equal(
    didJustCompleteFinalExercise(['1', '2', '3', '4'], ['1', '2', '3', '4', '5'], 6),
    false
  );
  assert.equal(
    didJustCompleteFinalExercise(['1', '2', '3', '4', '5', '6'], ['1', '2', '3', '4', '5'], 6),
    false
  );
});

test('getLast7DaysCompletionData returns the 7-day window ending on Today with accurate stats', () => {
  const days = generateInitial30DayCalendar(12);
  const weekly = getLast7DaysCompletionData(days);
  assert.equal(weekly.points.length, 7);
  assert.equal(weekly.points[0].dayNumber, 6);
  assert.equal(weekly.points[6].dayNumber, 12);
  assert.equal(weekly.points[6].isToday, true);
  assert.equal(weekly.completedInLast7, 4);
  assert.equal(weekly.weeklyConsistencyPercent, 57);
});

test('isPostWorkoutUnlocked unlocks strictly after all workout exercises are completed', () => {
  const required = ['ex1', 'ex2', 'ex3', 'ex4', 'ex5'];
  const partial = isPostWorkoutUnlocked(['ex1', 'ex2'], required);
  assert.equal(partial.unlocked, false);
  assert.equal(partial.remainingCount, 3);

  const complete = isPostWorkoutUnlocked(['ex1', 'ex2', 'ex3', 'ex4', 'ex5'], required);
  assert.equal(complete.unlocked, true);
  assert.equal(complete.remainingCount, 0);
});

test('calculateMobilityCompletion tracks primed joint exercises accurately', () => {
  assert.equal(DYNAMIC_MOBILITY_EXERCISES.length, 3);
  const initial = calculateMobilityCompletion([]);
  assert.equal(initial.completedCount, 0);
  assert.equal(initial.isAllPrimed, false);
  assert.equal(initial.completionPercent, 0);

  const oneDone = calculateMobilityCompletion(['mob-arm-circles']);
  assert.equal(oneDone.completedCount, 1);
  assert.equal(oneDone.isAllPrimed, false);
  assert.equal(oneDone.completionPercent, 33);

  const allDone = calculateMobilityCompletion([
    'mob-arm-circles',
    'mob-leg-swings',
    'mob-torso-twists',
  ]);
  assert.equal(allDone.completedCount, 3);
  assert.equal(allDone.isAllPrimed, true);
  assert.equal(allDone.completionPercent, 100);
});

test('formatElapsedMmSs formats seconds into standard MM:SS string', () => {
  assert.equal(formatElapsedMmSs(0), '00:00');
  assert.equal(formatElapsedMmSs(9), '00:09');
  assert.equal(formatElapsedMmSs(45), '00:45');
  assert.equal(formatElapsedMmSs(60), '01:00');
  assert.equal(formatElapsedMmSs(75), '01:15');
  assert.equal(formatElapsedMmSs(1205), '20:05');
  assert.equal(formatElapsedMmSs(-5), '00:00');
});

test('didCompleteCalendarDay returns true only when a day transitions from uncompleted to completed', () => {
  const days = generateInitial30DayCalendar(12);
  // Day 12 (Today) starts uncompleted -> completing it returns true
  assert.equal(didCompleteCalendarDay(days, 12), true);
  // Day 11 starts completed -> toggling it uncompletes it, so returns false
  assert.equal(didCompleteCalendarDay(days, 11), false);
});

test('toggleDayShield deploys and refunds streak shields, preserving active streak', () => {
  const days = generateInitial30DayCalendar(12);
  // Pre-conditions: Days 8, 9, 10, 11 are completed. Today (12) is uncompleted. Day 7 is uncompleted.
  const initialStreak = calculateStreakStats(days);
  assert.equal(initialStreak.activeStreak, 4);
  assert.equal(initialStreak.shieldsUsed, 0);

  // Deploy shield on Day 7 (a missed day right before day 8)
  const result = toggleDayShield(days, 7, 2);
  assert.equal(result.success, true);
  assert.equal(result.shieldsUsed, 1);
  assert.equal(result.days.find((d) => d.dayNumber === 7)?.isShielded, true);

  // Active streak should now span through Day 7
  // If Day 6 was also completed, it would connect!
  const withDay6Completed = result.days.map((d) => d.dayNumber === 6 ? { ...d, completed: true } : d);
  const shieldedStreak = calculateStreakStats(withDay6Completed);
  // 6 (done) + 7 (shielded) + 8 (done) + 9 (done) + 10 (done) + 11 (done) = 6 streak!
  assert.equal(shieldedStreak.activeStreak, 6);

  // Toggling Day 7 again removes the shield
  const refunded = toggleDayShield(result.days, 7, 2);
  assert.equal(refunded.success, true);
  assert.equal(refunded.shieldsUsed, 0);
  assert.equal(refunded.days.find((d) => d.dayNumber === 7)?.isShielded, false);
});

test('calculateMilestoneBadges calculates unlock status and progress for consistency milestones', () => {
  const days = generateInitial30DayCalendar(12);
  const badgesInitial = calculateMilestoneBadges(days, [], []);
  assert.equal(badgesInitial.length, 8);

  // Since days 8, 9, 10, 11 are completed (4 completed days, 4-day streak):
  const firstIgnition = badgesInitial.find((b) => b.id === 'first-session');
  assert.equal(firstIgnition?.isUnlocked, true);
  assert.equal(firstIgnition?.progress, 100);

  const streak3 = badgesInitial.find((b) => b.id === 'streak-3');
  assert.equal(streak3?.isUnlocked, true);

  const streak7 = badgesInitial.find((b) => b.id === 'streak-7');
  assert.equal(streak7?.isUnlocked, false);

  const mobilityBadge = badgesInitial.find((b) => b.id === 'mobility-disciple');
  assert.equal(mobilityBadge?.isUnlocked, false);

  // When all 3 mobility drills are completed
  const badgesWithMobility = calculateMilestoneBadges(days, ['ex1', 'ex2', 'ex3', 'ex4', 'ex5'], ['mob1', 'mob2', 'mob3']);
  const mobilityUnlocked = badgesWithMobility.find((b) => b.id === 'mobility-disciple');
  assert.equal(mobilityUnlocked?.isUnlocked, true);

  const tempoUnlocked = badgesWithMobility.find((b) => b.id === 'tempo-perfectionist');
  assert.equal(tempoUnlocked?.isUnlocked, true);
});

test('generateWorkoutShareText outputs clean, formatted summary with stats', () => {
  const text = generateWorkoutShareText({
    athleteName: 'Sharif',
    activeStreak: 5,
    totalCompleted: 5,
    sessionElapsedSeconds: 1215, // 20:15
    dateLabel: 'Oct 19',
    proteinGrams: 43,
  });
  assert.match(text, /Sharif/);
  assert.match(text, /5 Days/);
  assert.match(text, /20:15/);
  assert.match(text, /43g Protein/);
});

