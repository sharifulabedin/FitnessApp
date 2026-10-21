/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import {
  Flame,
  Check,
  Play,
  Bell,
  Settings,
  Calendar,
  CheckCircle2,
  Bot,
  LogOut,
  Sliders,
  Volume2,
  LayoutDashboard,
  ClipboardCheck,
  Dumbbell,
  Lock,
  Moon,
  Sun,
  Clock,
  Pause,
  RotateCcw,
  Shield,
  Share2,
  Zap,
  Camera,
} from 'lucide-react';
import {
  UserProfile,
  CalendarDay,
  NotificationSchedule,
  BottomNavSectionId,
  DEFAULT_USER_PROFILE,
  buildPersonalizedWorkout,
  generateInitial30DayCalendar,
  calculateStreakStats,
  toggleCalendarDay,
  didCompleteCalendarDay,
  calculateDailyProteinTarget,
  computePostWorkoutTime,
  resolveActiveSectionFromScroll,
  didJustCompleteFinalExercise,
  isPostWorkoutUnlocked,
  DYNAMIC_MOBILITY_EXERCISES,
  formatElapsedMmSs,
  toggleDayShield,
  calculateMilestoneBadges,
  MAX_STREAK_SHIELDS,
  logDayDuration,
  calculateEfficiencyStats,
  formatDurationMmSs,
  formatDurationHuman,
  formatHeight,
} from './utils/fitnessLogic';
import { ExerciseBodyPositionSvg, SharifAvatarSvg } from './components/ExerciseBodyPositionSvg';
import { LiveWorkoutModal } from './components/LiveWorkoutModal';
import { GeminiCoachDrawer, ChatMessage } from './components/GeminiCoachDrawer';
import { WeeklyCompletionChart } from './components/WeeklyCompletionChart';
import { PreWorkoutMobilitySection } from './components/PreWorkoutMobilitySection';
import { MilestoneBadgesCard } from './components/MilestoneBadgesCard';
import { WorkoutShareCardModal } from './components/WorkoutShareCardModal';
import { LogDurationModal } from './components/LogDurationModal';
import { ChangeProfilePicModal } from './components/ChangeProfilePicModal';
import {
  GoogleLoginSplash,
  BaselineOnboardingModal,
  SettingsBackupModal,
} from './components/OnboardingAndSettingsModals';

const STORAGE_KEYS = {
  AUTH: 'morning20_auth_v1',
  PROFILE: 'morning20_profile_v1',
  CALENDAR: 'morning20_calendar_v1',
  EXERCISES: 'morning20_completed_exercises_v1',
  PREP: 'morning20_prep_checklist_v1',
  NOTIFICATIONS: 'morning20_notifications_v1',
  CHAT: 'morning20_chat_history_v1',
  DARK_MODE: 'morning20_dark_mode_v1',
  MOBILITY: 'morning20_mobility_v1',
  SESSION_TIME: 'morning20_session_elapsed_v1',
  SESSION_RUNNING: 'morning20_session_running_v1',
};

const DEFAULT_PREP_CHECKLIST: Record<string, boolean> = {
  waterDates: false,
  towelLedge: false,
  cobraStretch: false,
  proteinBreakfast: false,
};

export default function App() {
  const isAutostart = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('autostart') === '1';
  }, []);

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    if (isAutostart) return true;
    try {
      return localStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
    } catch {
      return false;
    }
  });

  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore storage errors
    }
    return isAutostart ? { ...DEFAULT_USER_PROFILE, onboarded: true } : DEFAULT_USER_PROFILE;
  });

  const [showOnboardingModal, setShowOnboardingModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showChangeAvatarModal, setShowChangeAvatarModal] = useState<boolean>(false);

  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CALENDAR);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 30) return parsed;
      }
    } catch {
      // ignore
    }
    return generateInitial30DayCalendar(12);
  });

  const [completedExercises, setCompletedExercises] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXERCISES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [prepChecklist, setPrepChecklist] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PREP);
      return saved ? { ...DEFAULT_PREP_CHECKLIST, ...JSON.parse(saved) } : DEFAULT_PREP_CHECKLIST;
    } catch {
      return DEFAULT_PREP_CHECKLIST;
    }
  });

  const [completedMobility, setCompletedMobility] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MOBILITY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [notifSchedule, setNotifSchedule] = useState<NotificationSchedule>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      enabled: true,
      morningWorkoutTime: '07:00',
      proteinDelayMinutes: 45,
      hydrationReminder: true,
    };
  });

  const [notifBanner, setNotifBanner] = useState<string | null>(null);
  const [activeWorkoutIndex, setActiveWorkoutIndex] = useState<number | null>(null);
  const [isCoachOpen, setIsCoachOpen] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<BottomNavSectionId>('overview');
  const [poppingTab, setPoppingTab] = useState<BottomNavSectionId | 'coach' | null>(null);
  const [celebrationBanner, setCelebrationBanner] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [logDurationDayNumber, setLogDurationDayNumber] = useState<number | null>(null);
  const [shieldNotification, setShieldNotification] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.DARK_MODE) === 'true';
    } catch {
      return false;
    }
  });

  const [sessionElapsedSeconds, setSessionElapsedSeconds] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SESSION_TIME);
      if (saved) {
        const val = parseInt(saved, 10);
        if (!isNaN(val) && val >= 0) return val;
      }
    } catch {
      // ignore
    }
    return 0;
  });

  const [isSessionTimerRunning, setIsSessionTimerRunning] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.SESSION_RUNNING) === 'true';
    } catch {
      return false;
    }
  });

  // Dynamic session stopwatch
  useEffect(() => {
    let interval: number | null = null;
    if (isSessionTimerRunning) {
      interval = window.setInterval(() => {
        setSessionElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSessionTimerRunning]);

  // Persist session time & running status
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSION_TIME, String(sessionElapsedSeconds));
      localStorage.setItem(STORAGE_KEYS.SESSION_RUNNING, String(isSessionTimerRunning));
    } catch {
      // ignore
    }
  }, [sessionElapsedSeconds, isSessionTimerRunning]);

  const startSessionTimerIfNeeded = useCallback(() => {
    setIsSessionTimerRunning(true);
  }, []);

  const [animatingDayNumber, setAnimatingDayNumber] = useState<number | null>(null);
  const calendarStripRef = useRef<HTMLDivElement | null>(null);
  const popTimeoutRef = useRef<number | null>(null);
  const checkAnimTimeoutRef = useRef<number | null>(null);

  const triggerCalendarCheckAnim = useCallback((dayNum: number) => {
    setAnimatingDayNumber(dayNum);
    if (checkAnimTimeoutRef.current) {
      window.clearTimeout(checkAnimTimeoutRef.current);
    }
    checkAnimTimeoutRef.current = window.setTimeout(() => {
      setAnimatingDayNumber(null);
    }, 450);
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', darkMode);
    }
    try {
      localStorage.setItem(STORAGE_KEYS.DARK_MODE, String(darkMode));
    } catch {
      // ignore storage errors
    }
  }, [darkMode]);

  const triggerTabPop = useCallback((tabId: BottomNavSectionId | 'coach') => {
    setPoppingTab(tabId);
    if (popTimeoutRef.current) {
      window.clearTimeout(popTimeoutRef.current);
    }
    popTimeoutRef.current = window.setTimeout(() => {
      setPoppingTab(null);
    }, 360);
  }, []);

  useEffect(() => {
    if (isLoggedIn && calendarStripRef.current) {
      const container = calendarStripRef.current;
      const todayEl = container.querySelector('[data-today="true"]') as HTMLElement | null;
      if (todayEl) {
        const scrollLeft =
          todayEl.offsetLeft - container.clientWidth / 2 + todayEl.clientWidth / 2;
        container.scrollTo({ left: Math.max(0, scrollLeft), behavior: 'smooth' });
      }
    }
  }, [isLoggedIn]);

  const isProgrammaticScrollRef = useRef<boolean>(false);
  const programmaticScrollTimerRef = useRef<number | null>(null);

  // Passive scroll-spy listener to highlight the active bottom nav section
  useEffect(() => {
    if (!isLoggedIn) return;

    const sectionDomMap: { id: BottomNavSectionId; domId: string }[] = [
      { id: 'overview', domId: 'overview-section' },
      { id: 'streak', domId: 'streak-calendar' },
      { id: 'prep', domId: 'prep-section' },
      { id: 'circuit', domId: 'workout-circuit' },
    ];

    const handleScroll = () => {
      if (isProgrammaticScrollRef.current) return;
      const offsets = sectionDomMap
        .map((item) => {
          const el = document.getElementById(item.domId);
          return el ? { id: item.id, top: el.offsetTop } : null;
        })
        .filter((x): x is { id: BottomNavSectionId; top: number } => x !== null);

      const nextActive = resolveActiveSectionFromScroll(window.scrollY, offsets, 220);
      setActiveSection(nextActive);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoggedIn]);

  const handleJumpToSection = (sectionId: BottomNavSectionId, domId: string) => {
    isProgrammaticScrollRef.current = true;
    if (programmaticScrollTimerRef.current) {
      window.clearTimeout(programmaticScrollTimerRef.current);
    }
    programmaticScrollTimerRef.current = window.setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 650);

    triggerTabPop(sectionId);
    setActiveSection(sectionId);
    if (isCoachOpen) {
      setIsCoachOpen(false);
    }
    const targetEl = document.getElementById(domId);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CHAT);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [
      {
        id: 'welcome-1',
        role: 'model',
        text: `Morning Sharif! Your 20-minute hypertrophy routine is calibrated for 66kg → 72kg muscle gain using the 3-1-1 tempo. Ask me if you feel sore today, need push-up or towel pull-up adjustments, or want a 40g+ protein breakfast idea!`,
        timestamp: '7:00 AM',
        modelUsed: 'gemini-4-argon',
      },
    ];
  });

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH, String(isLoggedIn));
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
      localStorage.setItem(STORAGE_KEYS.CALENDAR, JSON.stringify(calendarDays));
      localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(completedExercises));
      localStorage.setItem(STORAGE_KEYS.PREP, JSON.stringify(prepChecklist));
      localStorage.setItem(STORAGE_KEYS.MOBILITY, JSON.stringify(completedMobility));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifSchedule));
      localStorage.setItem(STORAGE_KEYS.CHAT, JSON.stringify(chatMessages));
    } catch {
      // ignore quota errors
    }
  }, [
    isLoggedIn,
    profile,
    calendarDays,
    completedExercises,
    prepChecklist,
    completedMobility,
    notifSchedule,
    chatMessages,
  ]);

  const exercises = useMemo(() => buildPersonalizedWorkout(profile), [profile]);
  const mainCircuitExercises = useMemo(
    () => exercises.filter((ex) => ex.category !== 'cooldown'),
    [exercises]
  );
  const cooldownExerciseIndex = useMemo(
    () => exercises.findIndex((ex) => ex.category === 'cooldown'),
    [exercises]
  );
  const streakStats = useMemo(() => calculateStreakStats(calendarDays), [calendarDays]);
  const milestoneBadges = useMemo(
    () => calculateMilestoneBadges(calendarDays, completedExercises, completedMobility),
    [calendarDays, completedExercises, completedMobility]
  );
  const proteinTargets = useMemo(
    () => calculateDailyProteinTarget(profile.currentWeightKg, profile.targetWeightKg),
    [profile.currentWeightKg, profile.targetWeightKg]
  );
  const reminderTimes = useMemo(
    () => computePostWorkoutTime(notifSchedule.morningWorkoutTime, notifSchedule.proteinDelayMinutes),
    [notifSchedule.morningWorkoutTime, notifSchedule.proteinDelayMinutes]
  );
  const postWorkoutStatus = useMemo(
    () =>
      isPostWorkoutUnlocked(
        completedExercises,
        mainCircuitExercises.map((e) => e.id)
      ),
    [completedExercises, mainCircuitExercises]
  );

  const handleGoogleLogin = (name: string, email: string) => {
    const nextProfile: UserProfile = {
      ...profile,
      name,
      email,
    };
    setProfile(nextProfile);
    setIsLoggedIn(true);
    if (!nextProfile.onboarded) {
      setShowOnboardingModal(true);
    }
  };

  const handleSaveOnboarding = (updated: UserProfile) => {
    setProfile(updated);
    setShowOnboardingModal(false);
  };

  const handleSaveAvatar = (newAvatarUrl: string) => {
    setProfile((prev) => ({
      ...prev,
      avatarUrl: newAvatarUrl,
    }));
  };

  const handleToggleHeightUnit = () => {
    setProfile((prev) => ({
      ...prev,
      heightUnit: prev.heightUnit === 'ft' ? 'cm' : 'ft',
    }));
  };

  const handleSetHeightUnit = (unit: 'cm' | 'ft') => {
    setProfile((prev) => ({
      ...prev,
      heightUnit: unit,
    }));
  };

  const handleToggleDay = (dayNumber: number) => {
    setCalendarDays((prev) => {
      if (didCompleteCalendarDay(prev, dayNumber)) {
        triggerCalendarCheckAnim(dayNumber);
      }
      return toggleCalendarDay(prev, dayNumber);
    });
  };

  const handleToggleDayShield = (dayNumber: number) => {
    const res = toggleDayShield(calendarDays, dayNumber);
    if (res.success) {
      setCalendarDays(res.days);
    }
    setShieldNotification(res.message);
    setTimeout(() => setShieldNotification(null), 3800);
  };

  const handleToggleTodaySession = () => {
    const today = calendarDays.find((d) => d.isToday);
    if (today) {
      handleToggleDay(today.dayNumber);
    }
  };

  const handleSaveDayDuration = (dayNumber: number, durationSeconds: number) => {
    setCalendarDays((prev) => {
      if (durationSeconds > 0 && didCompleteCalendarDay(prev, dayNumber)) {
        triggerCalendarCheckAnim(dayNumber);
      }
      return logDayDuration(prev, dayNumber, durationSeconds);
    });
  };

  const efficiencyStats = useMemo(
    () => calculateEfficiencyStats(calendarDays),
    [calendarDays]
  );

  const fireWorkoutCompletionConfetti = useCallback(() => {
    setCelebrationBanner(true);
    try {
      const colors = ['#F43F5E', '#F59E0B', '#10B981', '#38BDF8'];
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { x: 0.25, y: 0.65 },
        colors,
        zIndex: 9999,
      });
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { x: 0.75, y: 0.65 },
        colors,
        zIndex: 9999,
      });
    } catch {
      // Ignore canvas error in non-DOM test environments
    }
  }, []);

  const handleToggleExerciseComplete = (exerciseId: string) => {
    startSessionTimerIfNeeded();
    const mainIds = mainCircuitExercises.map((e) => e.id);
    setCompletedExercises((prev) => {
      const next = prev.includes(exerciseId)
        ? prev.filter((id) => id !== exerciseId)
        : [...prev, exerciseId];

      const prevMainDone = prev.filter((id) => mainIds.includes(id));
      const nextMainDone = next.filter((id) => mainIds.includes(id));

      // Trigger canvas-confetti and log Today's streak when the final circuit exercise is completed
      if (didJustCompleteFinalExercise(prevMainDone, nextMainDone, mainIds.length)) {
        fireWorkoutCompletionConfetti();
        setIsSessionTimerRunning(false);
        setCalendarDays((days) => {
          const today = days.find((d) => d.isToday);
          if (today) {
            triggerCalendarCheckAnim(today.dayNumber);
          }
          return days.map((d) =>
            d.isToday
              ? {
                  ...d,
                  completed: true,
                  durationSeconds:
                    sessionElapsedSeconds > 0
                      ? sessionElapsedSeconds
                      : d.durationSeconds || 1170,
                }
              : d
          );
        });
      } else if (nextMainDone.length < mainIds.length) {
        setCelebrationBanner(false);
      }
      return next;
    });
  };

  const handleCompleteAllExercises = () => {
    startSessionTimerIfNeeded();
    const mainIds = mainCircuitExercises.map((e) => e.id);
    setCompletedExercises((prev) => {
      const prevMainDone = prev.filter((id) => mainIds.includes(id));
      if (didJustCompleteFinalExercise(prevMainDone, mainIds, mainIds.length)) {
        fireWorkoutCompletionConfetti();
        setIsSessionTimerRunning(false);
        setCalendarDays((days) => {
          const today = days.find((d) => d.isToday);
          if (today) {
            triggerCalendarCheckAnim(today.dayNumber);
          }
          return days.map((d) =>
            d.isToday
              ? {
                  ...d,
                  completed: true,
                  durationSeconds:
                    sessionElapsedSeconds > 0
                      ? sessionElapsedSeconds
                      : d.durationSeconds || 1170,
                }
              : d
          );
        });
      }
      return Array.from(new Set([...prev, ...mainIds]));
    });
  };

  const handleTogglePrep = (key: string) => {
    setPrepChecklist((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleToggleMobility = (id: string) => {
    setCompletedMobility((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSetAllMobility = (completed: boolean) => {
    setCompletedMobility(
      completed ? DYNAMIC_MOBILITY_EXERCISES.map((d) => d.id) : []
    );
  };

  const handleTestNotification = async (type: 'workout' | 'protein') => {
    const title =
      type === 'workout'
        ? `Morning 20 Workout (${reminderTimes.workoutTime12})`
        : `Post-Workout Protein Window (${reminderTimes.proteinTime12})`;
    const body =
      type === 'workout'
        ? `Time for your 20-min 3-1-1 hypertrophy circuit, ${profile.name}! Drink 500ml water + 2 dates and set your towel on the ledge.`
        : `45 mins post-workout! Hit ${proteinTargets.postWorkoutGrams}g protein now to lock in muscle recovery.`;

    setNotifBanner(`${title}: ${body}`);

    try {
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(title, { body });
        } else if (Notification.permission !== 'denied') {
          const perm = await Notification.requestPermission();
          if (perm === 'granted') {
            new Notification(title, { body });
          }
        }
      }
    } catch {
      // Fallback banner already displayed in UI
    }
  };

  const handleResetAllData = () => {
    try {
      Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    } catch {
      // ignore
    }
    setProfile(DEFAULT_USER_PROFILE);
    setCalendarDays(generateInitial30DayCalendar(12));
    setCompletedExercises([]);
    setPrepChecklist(DEFAULT_PREP_CHECKLIST);
    setCompletedMobility([]);
    setSessionElapsedSeconds(0);
    setIsSessionTimerRunning(false);
    setShowSettingsModal(false);
    setShowOnboardingModal(false);
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <GoogleLoginSplash onGoogleLogin={handleGoogleLogin} />;
  }

  return (
    <div id="top" className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 pb-28 transition-colors">
      {/* Strictly Compliant 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <a
          href="#top"
          className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 focus-ring-tactile rounded-lg px-1 hover:opacity-85 transition-opacity"
        >
          Morning 20
        </a>

        <nav
          aria-label="Primary sections"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300"
        >
          <a
            href="#streak-calendar"
            className="hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 focus-ring-tactile rounded-lg px-1.5 py-0.5"
          >
            Streak
          </a>
          <a
            href="#workout-circuit"
            className="hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 focus-ring-tactile rounded-lg px-1.5 py-0.5"
          >
            Circuit
          </a>
          <a
            href="#smart-reminders"
            className="hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 focus-ring-tactile rounded-lg px-1.5 py-0.5"
          >
            Reminders
          </a>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => {
              startSessionTimerIfNeeded();
              setActiveWorkoutIndex(0);
            }}
            className="tactile-button focus-ring-tactile min-h-[44px] px-4 py-2 text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition-all whitespace-nowrap shrink-0 shadow-sm"
          >
            Start 20-Min Session
          </button>
        </div>
      </header>

      {/* Main Responsive Bento Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8 space-y-6">
        {/* Athlete Welcome & Workspace Bar + 4-Column KPI Bento Strip */}
        <section
          id="overview-section"
          className="scroll-mt-6 bento-card-tactile p-6 sm:p-7"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <div className="relative">
                <SharifAvatarSvg
                  name={profile.name}
                  avatarUrl={profile.avatarUrl}
                  className="w-14 h-14 sm:w-16 sm:h-16 shadow-md"
                  onEdit={() => setShowChangeAvatarModal(true)}
                  showBadge
                />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span>Google Authenticated</span>
                  <span>·</span>
                  <span className="truncate max-w-[200px]">{profile.email}</span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-mono text-slate-700 dark:text-slate-300">
                    Height: <strong className="text-slate-900 dark:text-white font-bold">{formatHeight(profile.heightCm, profile.heightUnit)}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={handleToggleHeightUnit}
                    title={`Click to switch height display to ${profile.heightUnit === 'ft' ? 'centimeters (cm)' : 'feet and inches (ft/in)'}`}
                    aria-label={`Switch height display to ${profile.heightUnit === 'ft' ? 'centimeters' : 'feet and inches'}`}
                    className="tactile-button focus-ring-tactile px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60 transition-colors cursor-pointer"
                  >
                    Show in {profile.heightUnit === 'ft' ? 'cm' : 'ft & in'}
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => setShowChangeAvatarModal(true)}
                    className="focus-ring-tactile rounded-md inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <Camera className="w-3 h-3" />
                    <span>Change Photo</span>
                  </button>
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight text-balance">
                  Morning, {profile.name}. Ready for Day 12?
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                data-testid="theme-toggle-button"
                aria-pressed={darkMode}
                aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                onClick={() => setDarkMode((prev) => !prev)}
                className="tactile-button focus-ring-tactile min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
              >
                {darkMode ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-slate-700" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowOnboardingModal(true)}
                className="tactile-button focus-ring-tactile min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Calibrate Baselines</span>
              </button>
              <button
                type="button"
                onClick={() => setShowSettingsModal(true)}
                aria-label="Open Settings and JSON Backup"
                className="tactile-button focus-ring-tactile min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Backup &amp; Settings</span>
              </button>
              <button
                type="button"
                onClick={() => setIsLoggedIn(false)}
                aria-label="Sign out of session"
                className="tactile-button focus-ring-tactile min-h-[44px] px-3 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium flex items-center gap-1 transition-colors whitespace-nowrap shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* 4-Column Hypertrophy & Streak Metrics Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-5">
            <div className="bento-tile-tactile p-4">
              <div className="text-xs text-slate-500 dark:text-slate-400">Active Morning Streak</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span
                  data-testid="active-streak-count"
                  className="font-mono tabular-nums text-3xl font-bold text-rose-500 dark:text-rose-400"
                >
                  {streakStats.activeStreak}
                </span>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Days</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {streakStats.totalCompleted}/30 days logged ({streakStats.completionRate}%)
              </div>
            </div>

            <div className="bento-tile-tactile p-4">
              <div className="text-xs text-slate-500 dark:text-slate-400">Hypertrophy Weight Goal</div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="font-mono tabular-nums text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  {profile.currentWeightKg}
                </span>
                <span className="text-xs text-slate-400">→</span>
                <span className="font-mono tabular-nums text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {profile.targetWeightKg}
                </span>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">kg</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                +{Math.max(0, profile.targetWeightKg - profile.currentWeightKg)} kg lean mass target
              </div>
            </div>

            <div className="bento-tile-tactile p-4">
              <div className="text-xs text-slate-500 dark:text-slate-400">Calibrated Rep Baselines</div>
              <div className="mt-1 font-mono tabular-nums text-2xl font-bold text-slate-900 dark:text-white">
                {profile.maxPushUps} Push · {profile.maxPullUps} Pull
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                3-1-1 Tempo + 4s Eccentric Negatives
              </div>
            </div>

            <div className="bento-tile-tactile p-4">
              <div className="text-xs text-slate-500 dark:text-slate-400">Daily Protein Target</div>
              <div className="mt-1 font-mono tabular-nums text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400">
                {proteinTargets.gramsPerDay}g
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {proteinTargets.postWorkoutGrams}g in 45m post-workout meal
              </div>
            </div>
          </div>

          {/* Recharts Weekly Completion Progress Bar & 7-Day Consistency Chart */}
          <WeeklyCompletionChart
            calendarDays={calendarDays}
            onToggleDay={handleToggleDay}
            onOpenLogDuration={(dayNum) => setLogDurationDayNumber(dayNum)}
            darkMode={darkMode}
          />
        </section>

        {/* 30-Day Horizontal Interactive Calendar & Active Streak Grid */}
        <section
          id="streak-calendar"
          className="scroll-mt-6 bento-card-tactile p-6 sm:p-7"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                30-Day Hypertrophy Consistency · Every 7th Day is Active Recovery
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-rose-500" />
                <span>30-Day Calendar &amp; Active Streak Strip</span>
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setLogDurationDayNumber(12)}
                className="tactile-button focus-ring-tactile min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                <span>Log Duration</span>
              </button>

              <button
                type="button"
                onClick={() => setShowShareModal(true)}
                className="tactile-button focus-ring-tactile min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Share Card</span>
              </button>

              <button
                type="button"
                onClick={handleToggleTodaySession}
                className={`tactile-button focus-ring-tactile min-h-[44px] px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 ${
                  streakStats.todayCompleted
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-rose-500 text-white hover:bg-rose-600'
                }`}
              >
                <CheckCircle2
                  key={streakStats.todayCompleted ? 'today-completed' : 'today-pending'}
                  className={`w-4 h-4 ${streakStats.todayCompleted ? 'animate-calendar-check' : ''}`}
                />
                <span>
                  {streakStats.todayCompleted
                    ? "Today's Session Completed (Streak +1)"
                    : "Tick Off Today's 20-Min Session"}
                </span>
              </button>
            </div>
          </div>

          {/* 30-Day Efficiency & Pace Improvements Hub */}
          <div
            data-testid="efficiency-tracker-hub"
            className="bento-tile-tactile mb-4 p-4 bg-gradient-to-r from-emerald-500/10 via-sky-500/10 to-transparent border border-emerald-500/20 dark:border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
          >
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs font-semibold text-slate-800 dark:text-slate-200">
                <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>
                  Avg Pace:{' '}
                  <strong className="font-mono tabular-nums text-slate-900 dark:text-white">
                    {formatDurationHuman(efficiencyStats.averageDurationSeconds)}
                  </strong>
                </span>
              </div>

              {efficiencyStats.fastestDurationSeconds > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs font-semibold text-slate-800 dark:text-slate-200">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>
                    Fastest (Day {efficiencyStats.fastestDayNumber}):{' '}
                    <strong className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                      {formatDurationMmSs(efficiencyStats.fastestDurationSeconds)}
                    </strong>
                  </span>
                </div>
              )}

              {efficiencyStats.improvementSeconds > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100/90 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-semibold">
                  <span className="font-mono tabular-nums">
                    ↓ {formatDurationHuman(efficiencyStats.improvementSeconds)} faster
                  </span>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-mono">
                    (+{efficiencyStats.improvementPercent}% efficiency)
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden xl:inline">
                Track how much faster you complete the 20-min hypertrophy circuit over 30 days
              </span>
              <button
                type="button"
                onClick={() => setLogDurationDayNumber(12)}
                className="tactile-button focus-ring-tactile min-h-[36px] px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-xs"
              >
                <Clock className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                <span>Log Today&apos;s Time</span>
              </button>
            </div>
          </div>

          {/* Gamification & Streak Shield Motivation Hub */}
          <div className="bento-tile-tactile mb-4 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 font-mono font-bold text-slate-900 dark:text-white px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
                <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
                <span>{streakStats.activeStreak} Days Unbroken Streak</span>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 text-cyan-900 dark:text-cyan-200">
                <Shield className="w-4 h-4 text-cyan-600 fill-cyan-500/20" />
                <span>
                  Streak Shields:{' '}
                  <strong>
                    {MAX_STREAK_SHIELDS - streakStats.shieldsUsed} / {MAX_STREAK_SHIELDS}
                  </strong>{' '}
                  Available
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400 hidden lg:inline">
                Click shield icon on any rest/missed day to prevent streak reset
              </span>
              {streakStats.shieldsUsed < MAX_STREAK_SHIELDS && (
                <button
                  type="button"
                  onClick={() => {
                    const today = calendarDays.find((d) => d.isToday);
                    if (today) handleToggleDayShield(today.dayNumber);
                  }}
                  className="tactile-button focus-ring-tactile min-h-[36px] px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Shield Today</span>
                </button>
              )}
            </div>
          </div>

          <AnimatePresence>
            {shieldNotification && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mb-4 p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/70 border border-cyan-300 dark:border-cyan-800 text-cyan-950 dark:text-cyan-100 font-medium text-xs flex items-center justify-between"
              >
                <span>{shieldNotification}</span>
                <button
                  type="button"
                  onClick={() => setShieldNotification(null)}
                  aria-label="Dismiss shield notification"
                  className="focus-ring-tactile rounded p-1 text-cyan-700 dark:text-cyan-300 hover:text-cyan-950 dark:hover:text-white ml-2"
                >
                  ✕
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Horizontal Scrolling 30-Day Strip */}
          <div
            ref={calendarStripRef}
            className="flex items-stretch gap-2.5 overflow-x-auto pb-3 pt-1"
          >
            {calendarDays.map((day) => {
              const isDone = day.completed;
              const isToday = day.isToday;
              const isRec = day.isRecoveryDay;
              const isShielded = day.isShielded;

              let cardStyle =
                'bg-slate-50 dark:bg-slate-800/70 border-slate-200/90 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600';
              if (isDone && isToday) {
                cardStyle =
                  'bg-emerald-600 dark:bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-400/40';
              } else if (isToday) {
                cardStyle =
                  'bg-rose-500 dark:bg-rose-600 border-rose-400 text-white shadow-md shadow-rose-500/30 ring-2 ring-rose-400/40';
              } else if (isDone) {
                cardStyle =
                  'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200';
              } else if (isShielded) {
                cardStyle =
                  'bg-cyan-50/90 dark:bg-cyan-950/60 border-cyan-300 dark:border-cyan-800 text-cyan-900 dark:text-cyan-200 shadow-2xs';
              } else if (isRec) {
                cardStyle =
                  'bg-amber-50/80 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800/70 text-amber-900 dark:text-amber-200';
              }

              return (
                <div
                  key={day.dayNumber}
                  className={`relative min-w-[84px] min-h-[104px] p-3 rounded-2xl border flex flex-col justify-between text-left transition-all shrink-0 ${cardStyle}`}
                >
                  {/* Top Bar: Day Number + Quick Shield Button */}
                  <div className="flex items-center justify-between w-full text-[11px] font-mono tabular-nums">
                    <span>D{String(day.dayNumber).padStart(2, '0')}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleDayShield(day.dayNumber);
                      }}
                      title={
                        isShielded
                          ? 'Remove Streak Shield (Refund)'
                          : 'Deploy Streak Shield to protect consistency'
                      }
                      aria-label={`Toggle shield for Day ${day.dayNumber}`}
                      className={`focus-ring-tactile min-w-[28px] min-h-[28px] p-1 rounded-lg flex items-center justify-center transition-transform hover:scale-110 active:scale-95 ${
                        isShielded
                          ? 'text-cyan-600 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300'
                          : 'opacity-50 hover:opacity-100 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <Shield
                        className={`w-3.5 h-3.5 ${
                          isShielded ? 'fill-cyan-500/30 text-cyan-600 dark:text-cyan-400 stroke-[2.2]' : ''
                        }`}
                      />
                    </button>
                  </div>

                  <button
                    type="button"
                    data-today={isToday ? 'true' : undefined}
                    onClick={() => handleToggleDay(day.dayNumber)}
                    aria-label={`Day ${day.dayNumber}, ${day.dateLabel}${
                      isShielded ? ', Streak Shielded' : ''
                    }${isRec ? ', Active Recovery Day' : ''}${isToday ? ', Today' : ''}${
                      isDone ? ', Completed' : ''
                    }`}
                    className="w-full text-left my-1 focus-ring-tactile rounded-lg"
                  >
                    <div className="font-mono tabular-nums text-sm font-bold">
                      {day.dateLabel}
                    </div>
                    <div className="text-[10px] opacity-85 mt-0.5 truncate">
                      {isToday
                        ? 'Today'
                        : isShielded
                        ? 'Shielded'
                        : isRec
                        ? 'Recovery'
                        : 'Hypertrophy'}
                    </div>
                  </button>

                  <div className="flex items-center justify-between w-full text-[10px] font-semibold">
                    <span>
                      {isDone
                        ? 'Done'
                        : isShielded
                        ? 'Protected'
                        : isRec
                        ? 'Mobility'
                        : '20m'}
                    </span>
                    {isDone && (
                      <span
                        data-testid={`calendar-check-${day.dayNumber}`}
                        data-animating={animatingDayNumber === day.dayNumber ? 'true' : undefined}
                        className={`inline-flex items-center justify-center w-4 h-4 rounded-full transition-transform duration-300 ${
                          isToday
                            ? 'bg-white/25 text-white'
                            : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                        } ${
                          animatingDayNumber === day.dayNumber
                            ? 'scale-110 ring-2 ring-emerald-400/50'
                            : ''
                        }`}
                      >
                        <Check className="w-3 h-3 stroke-[2.75] animate-calendar-check" />
                      </span>
                    )}
                    {!isDone && isShielded && (
                      <Shield className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 fill-cyan-500/20" />
                    )}
                  </div>

                  {/* Logged Session Duration Pill */}
                  {day.durationSeconds ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLogDurationDayNumber(day.dayNumber);
                      }}
                      title={`Logged Duration: ${formatDurationHuman(day.durationSeconds)}. Click to edit.`}
                      aria-label={`Logged duration: ${formatDurationHuman(day.durationSeconds)}. Click to edit.`}
                      className="tactile-button focus-ring-tactile mt-1.5 w-full min-h-[26px] px-1.5 py-0.5 rounded-lg bg-black/10 dark:bg-white/10 hover:bg-black/15 dark:hover:bg-white/20 flex items-center justify-between text-[10px] font-mono tabular-nums font-semibold transition-colors"
                    >
                      <span className="flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5 opacity-70" />
                        <span>{formatDurationMmSs(day.durationSeconds)}</span>
                      </span>
                      {efficiencyStats.fastestDayNumber === day.dayNumber && (
                        <span className="text-[9px] text-amber-500 font-bold" title="Fastest Personal Record">
                          ⚡PR
                        </span>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLogDurationDayNumber(day.dayNumber);
                      }}
                      title="Click to log workout session duration"
                      aria-label={`Click to log workout duration for Day ${day.dayNumber}`}
                      className="tactile-button focus-ring-tactile mt-1.5 w-full min-h-[26px] px-1.5 py-0.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 text-[10px] font-medium opacity-70 hover:opacity-100 flex items-center justify-center gap-1 transition-opacity"
                    >
                      <Clock className="w-2.5 h-2.5" />
                      <span>Log Time</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Milestone Achievements & Trophies Bento Card */}
          <div className="mt-6">
            <MilestoneBadgesCard
              badges={milestoneBadges}
              onOpenShareModal={() => setShowShareModal(true)}
              darkMode={darkMode}
            />
          </div>
        </section>

        {/* Pre-Workout Prep + Smart Notification Scheduler Bento Row */}
        <div
          id="prep-section"
          className="scroll-mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
        >
          {/* Left 7 Cols: Pre-Workout Prep Checklist Only */}
          <section className="bento-card-tactile lg:col-span-7 p-6 flex flex-col justify-between">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Phase 1 · Complete Before Starting Your 20-Minute Hypertrophy Circuit
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                Pre-Workout Prep Checklist
              </h2>

              <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
                <button
                  type="button"
                  onClick={() => handleTogglePrep('waterDates')}
                  className="tactile-button focus-ring-tactile w-full min-h-[56px] py-3.5 flex items-center justify-between gap-4 text-left hover:bg-slate-50/80 dark:hover:bg-slate-800/60 rounded-2xl px-3 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700/60"
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      01. 500ml Warm Water + 2 Medjool Dates (Pre-Workout)
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Rapid glucose for morning glycogen + cellular hydration 10 mins before Round 1
                    </div>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      prepChecklist.waterDates
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                    }`}
                  >
                    {prepChecklist.waterDates && <Check className="w-4 h-4" />}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleTogglePrep('towelLedge')}
                  className="tactile-button focus-ring-tactile w-full min-h-[56px] py-3.5 flex items-center justify-between gap-4 text-left hover:bg-slate-50/80 dark:hover:bg-slate-800/60 rounded-2xl px-3 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700/60"
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      02. Folded Towel Grip on Overhead Door/Beam Ledge
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Cushions finger joints and pre-activates forearm flexors for 4s negative pull-ups
                    </div>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      prepChecklist.towelLedge
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                    }`}
                  >
                    {prepChecklist.towelLedge && <Check className="w-4 h-4" />}
                  </div>
                </button>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>
                Pre-Session Readiness:{' '}
                <strong className="text-slate-900 dark:text-white font-mono tabular-nums">
                  {(prepChecklist.waterDates ? 1 : 0) + (prepChecklist.towelLedge ? 1 : 0)} / 2
                </strong>{' '}
                Completed
              </span>
              <a
                href="#post-workout-section"
                className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-semibold hover:underline underline-offset-4 focus-ring-tactile rounded px-1"
              >
                Post-Workout follows Circuit →
              </a>
            </div>
          </section>

          {/* Right 5 Cols: Smart Time-to-Time Notifications & Local Reminders */}
          <section
            id="smart-reminders"
            className="bento-card-tactile lg:col-span-5 p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Browser Notification API · Circadian Habit Triggers
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-amber-500" />
                    <span>Smart Reminder Scheduler</span>
                  </h2>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <label
                    htmlFor="morning-workout-time"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Morning 20 Workout Alarm Time
                  </label>
                  <input
                    id="morning-workout-time"
                    type="time"
                    value={notifSchedule.morningWorkoutTime}
                    onChange={(e) =>
                      setNotifSchedule((prev) => ({
                        ...prev,
                        morningWorkoutTime: e.target.value,
                      }))
                    }
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-sm text-slate-900 dark:text-white focus-ring-tactile"
                  />
                </div>

                {/* Calculated Schedule Timeline */}
                <div className="bento-tile-tactile p-4 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Morning Circuit Trigger:</span>
                    <span className="font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                      {reminderTimes.workoutTime12}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">
                      Post-Workout Protein Meal (+{notifSchedule.proteinDelayMinutes}m):
                    </span>
                    <span className="font-mono tabular-nums font-bold text-rose-600 dark:text-rose-400">
                      {reminderTimes.proteinTime12}
                    </span>
                  </div>
                </div>

                {notifBanner && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200">
                    {notifBanner}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleTestNotification('workout')}
                className="tactile-button focus-ring-tactile min-h-[44px] px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
              >
                Test 7:00 AM Alert
              </button>
              <button
                type="button"
                onClick={() => handleTestNotification('protein')}
                className="tactile-button focus-ring-tactile min-h-[44px] px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
              >
                Test +45m Fuel Alert
              </button>
            </div>
          </section>
        </div>

        {/* Main 20-Minute Full-Body Workout Circuit Grid */}
        <section id="workout-circuit" className="scroll-mt-6 space-y-6">
          {/* Pre-Workout Dynamic Mobility Section (Arm circles, Leg swings, Torso twists) */}
          <PreWorkoutMobilitySection
            completedMobilityIds={completedMobility}
            onToggleMobility={handleToggleMobility}
            onSetAllMobility={handleSetAllMobility}
            darkMode={darkMode}
          />

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pt-2">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Phase 2B · 3 Rounds · 45s Work / 15s Rest · Click Any Exercise for Fullscreen Live 3-1-1 Tempo Mode
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-2">
                <Flame className="w-6 h-6 text-rose-500" />
                <span>20-Minute Full-Body Hypertrophy Circuit</span>
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Dynamic Workout Session Total Time Field */}
              <div
                data-testid="circuit-total-time"
                className={`bento-tile-tactile min-h-[44px] px-3.5 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-mono tabular-nums transition-all ${
                  isSessionTimerRunning
                    ? 'bg-rose-50/90 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-200 shadow-xs'
                    : sessionElapsedSeconds > 0
                    ? 'bg-emerald-50/90 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200 shadow-xs'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Clock
                  className={`w-4 h-4 shrink-0 ${
                    isSessionTimerRunning
                      ? 'text-rose-500 animate-pulse'
                      : sessionElapsedSeconds > 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-400'
                  }`}
                />
                <span className="font-semibold text-slate-600 dark:text-slate-400">Total Time:</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {formatElapsedMmSs(sessionElapsedSeconds)}
                </span>
                <div className="flex items-center gap-1 ml-1 pl-1.5 border-l border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setIsSessionTimerRunning((prev) => !prev)}
                    aria-label={isSessionTimerRunning ? 'Pause total time timer' : 'Start total time timer'}
                    className="tactile-stepper-btn focus-ring-tactile min-w-[36px] min-h-[36px] p-1.5 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    {isSessionTimerRunning ? (
                      <Pause className="w-3.5 h-3.5" />
                    ) : (
                      <Play className="w-3.5 h-3.5" />
                    )}
                  </button>
                  {sessionElapsedSeconds > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setSessionElapsedSeconds(0);
                        setIsSessionTimerRunning(false);
                      }}
                      aria-label="Reset total time timer to 00:00"
                      className="tactile-stepper-btn focus-ring-tactile min-w-[36px] min-h-[36px] p-1.5 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="text-xs font-mono tabular-nums text-slate-600 dark:text-slate-400">
                Completed Today:{' '}
                <strong className="text-slate-900 dark:text-white">
                  {postWorkoutStatus.completedCount} / {postWorkoutStatus.totalRequired}
                </strong>{' '}
                Exercises
              </div>
            </div>
          </div>

          <AnimatePresence>
            {celebrationBanner && postWorkoutStatus.unlocked && (
              <motion.div
                role="status"
                data-testid="circuit-complete-banner"
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ type: 'spring', stiffness: 450, damping: 28 }}
                className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-emerald-900/20"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-200" />
                  <div>
                    <div className="text-sm font-bold">
                      20-Minute Hypertrophy Circuit Complete! Post-Workout Phase Unlocked Below
                    </div>
                    <div className="text-xs text-emerald-100">
                      All {postWorkoutStatus.totalRequired} workout exercises finished, {profile.name}! Today&apos;s streak is logged — proceed to Post-Workout Cobra Stretch &amp; {proteinTargets.postWorkoutGrams}g protein refuel below.
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowShareModal(true)}
                    className="tactile-button focus-ring-tactile min-h-[44px] px-3.5 py-2 rounded-xl bg-white text-emerald-950 text-xs font-semibold hover:bg-emerald-50 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-xs"
                  >
                    <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Share Achievement Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={fireWorkoutCompletionConfetti}
                    className="tactile-button focus-ring-tactile min-h-[44px] px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
                  >
                    Replay Confetti
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {mainCircuitExercises.map((ex) => {
              const fullIndex = exercises.findIndex((item) => item.id === ex.id);
              const isDone = completedExercises.includes(ex.id);
              return (
                <article
                  key={ex.id}
                  className={`bento-card-tactile transition-all p-5 flex flex-col justify-between border ${
                    isDone
                      ? 'border-emerald-400 dark:border-emerald-600 bg-emerald-50/30 dark:bg-emerald-950/20'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div>
                    {/* Top Metadata Line */}
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                      <span>
                        {ex.stepNumber} · {ex.rounds} {ex.rounds === 1 ? 'Round' : 'Rounds'} · {ex.workSeconds}s/{ex.restSeconds}s
                      </span>
                      <span className="text-rose-600 dark:text-rose-400 font-semibold">{ex.tempo}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1.5">
                      {ex.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {ex.subtitle}
                    </p>

                    {/* Interactive Biomechanical SVG Preview - Accessible semantic button */}
                    <button
                      type="button"
                      onClick={() => {
                        startSessionTimerIfNeeded();
                        setActiveWorkoutIndex(fullIndex);
                      }}
                      aria-label={`Start live 3-1-1 timer and view biomechanical form for ${ex.name}`}
                      className="w-full text-left mt-3 cursor-pointer rounded-2xl overflow-hidden group relative focus-ring-tactile block border border-slate-200/60 dark:border-slate-700/60"
                    >
                      <ExerciseBodyPositionSvg
                        poseType={ex.poseType}
                        depthFactor={0.4}
                        className="w-full h-36 transition-transform duration-200 group-hover:scale-[1.02]"
                      />
                      <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-slate-900/85 backdrop-blur-xs text-white text-[11px] font-medium flex items-center gap-1 shadow-sm">
                        <Volume2 className="w-3 h-3 text-amber-400" />
                        <span>Live 3-1-1 Timer</span>
                      </div>
                    </button>

                    <div className="mt-3 text-xs text-slate-700 dark:text-slate-300 font-mono tabular-nums">
                      Prescription: <strong className="text-slate-900 dark:text-white">{ex.prescribedReps}</strong>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {ex.targetMuscles}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        startSessionTimerIfNeeded();
                        setActiveWorkoutIndex(fullIndex);
                      }}
                      className="tactile-button focus-ring-tactile flex-1 min-h-[44px] px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Live Position &amp; Timer</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleExerciseComplete(ex.id)}
                      aria-label={isDone ? `Unmark ${ex.name} completed` : `Mark ${ex.name} completed`}
                      className={`tactile-button focus-ring-tactile min-h-[44px] min-w-[44px] px-3 rounded-xl border text-xs font-semibold flex items-center justify-center transition-colors shrink-0 ${
                        isDone
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Post-Workout Recovery & High-Protein Breakfast Section (Comes Strictly After Exercise Complete) */}
        <section
          id="post-workout-section"
          data-testid="post-workout-section"
          className={`scroll-mt-6 bento-card-tactile p-6 sm:p-7 transition-all ${
            postWorkoutStatus.unlocked
              ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-400 dark:border-emerald-600'
              : ''
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                {postWorkoutStatus.unlocked
                  ? `Phase 3 · Unlocked! All ${postWorkoutStatus.totalRequired} Exercises Completed`
                  : `Phase 3 · Unlocks After Exercise Complete (${postWorkoutStatus.completedCount} / ${postWorkoutStatus.totalRequired} Exercises Done)`}
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-2">
                {postWorkoutStatus.unlocked ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <Lock className="w-5 h-5 text-slate-400 shrink-0" />
                )}
                <span>Post-Workout Cobra Stretch &amp; High-Protein Fuel Bonus</span>
              </h2>
            </div>

            {!postWorkoutStatus.unlocked ? (
              <button
                type="button"
                onClick={handleCompleteAllExercises}
                className="tactile-button focus-ring-tactile min-h-[44px] px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
              >
                <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                <span>
                  Complete Remaining {postWorkoutStatus.remainingCount}{' '}
                  {postWorkoutStatus.remainingCount === 1 ? 'Exercise' : 'Exercises'} to Unlock
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-2.5">
                {cooldownExerciseIndex >= 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveWorkoutIndex(cooldownExerciseIndex)}
                    className="tactile-button focus-ring-tactile min-h-[44px] px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Launch 45s Cobra Stretch Timer</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {!postWorkoutStatus.unlocked && (
            <div
              data-testid="post-workout-locked-notice"
              className="bento-tile-tactile mt-4 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-300"
            >
              <span>
                Finish all <strong>{postWorkoutStatus.totalRequired} workout exercises</strong> above first to unlock your post-workout Cobra decompression and {proteinTargets.postWorkoutGrams}g+ protein refuel checklist.
              </span>
              <span className="font-mono tabular-nums font-bold text-slate-800 dark:text-white shrink-0">
                {Math.round((postWorkoutStatus.completedCount / Math.max(1, postWorkoutStatus.totalRequired)) * 100)}% Exercises Done
              </span>
            </div>
          )}

          <div
            className={`mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity ${
              postWorkoutStatus.unlocked ? 'opacity-100' : 'opacity-60'
            }`}
          >
            <button
              type="button"
              disabled={!postWorkoutStatus.unlocked}
              onClick={() => handleTogglePrep('cobraStretch')}
              className={`tactile-button focus-ring-tactile min-h-[76px] p-4 rounded-2xl border text-left flex items-center justify-between gap-4 transition-colors ${
                !postWorkoutStatus.unlocked
                  ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 cursor-not-allowed opacity-60'
                  : prepChecklist.cobraStretch
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700'
                  : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:bg-slate-50/80 dark:hover:bg-slate-800'
              }`}
            >
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  01. Post-Workout Cobra Stretch &amp; Thoracic Decompression
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  45s prone lumbar extension + 4-7-8 nasal breathing to lower cortisol after completing your circuit
                </div>
              </div>
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  prepChecklist.cobraStretch
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                }`}
              >
                {prepChecklist.cobraStretch && <Check className="w-4 h-4" />}
              </div>
            </button>

            <button
              type="button"
              disabled={!postWorkoutStatus.unlocked}
              onClick={() => handleTogglePrep('proteinBreakfast')}
              className={`tactile-button focus-ring-tactile min-h-[76px] p-4 rounded-2xl border text-left flex items-center justify-between gap-4 transition-colors ${
                !postWorkoutStatus.unlocked
                  ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 cursor-not-allowed opacity-60'
                  : prepChecklist.proteinBreakfast
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700'
                  : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:bg-slate-50/80 dark:hover:bg-slate-800'
              }`}
            >
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  02. High-Protein Breakfast Bonus ({proteinTargets.postWorkoutGrams}g+ Protein)
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  3 pasture-raised eggs + Greek yogurt or whey shake consumed by {reminderTimes.proteinTime12}
                </div>
              </div>
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  prepChecklist.proteinBreakfast
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                }`}
              >
                {prepChecklist.proteinBreakfast && <Check className="w-4 h-4" />}
              </div>
            </button>
          </div>
        </section>
      </main>

      {/* Liquid Glass Capsule Bottom Navigation Dock */}
      <nav
        aria-label="Section jump bottom navigation"
        className="fixed bottom-3.5 sm:bottom-5 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-20px)] sm:w-auto max-w-fit rounded-full p-1.5 sm:p-2 liquid-glass-dock shadow-xl"
      >
        <div className="flex items-center justify-between sm:justify-center gap-1 sm:gap-2 max-w-lg mx-auto sm:max-w-none">
          {(
            [
              {
                id: 'overview' as const,
                domId: 'overview-section',
                label: 'Overview',
                icon: LayoutDashboard,
              },
              {
                id: 'streak' as const,
                domId: 'streak-calendar',
                label: 'Streak',
                icon: Calendar,
              },
              {
                id: 'prep' as const,
                domId: 'prep-section',
                label: 'Prep',
                icon: ClipboardCheck,
              },
              {
                id: 'circuit' as const,
                domId: 'workout-circuit',
                label: 'Circuit',
                icon: Dumbbell,
              },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const isActive = !isCoachOpen && activeSection === tab.id;
            const isPopping = poppingTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                data-testid={`bottom-nav-${tab.id}`}
                aria-current={isActive ? 'location' : undefined}
                onClick={() => handleJumpToSection(tab.id, tab.domId)}
                className={`focus-ring-tactile min-h-[44px] min-w-[44px] px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-95 whitespace-nowrap shrink-0 ${
                  isPopping ? 'animate-nav-pop' : ''
                } ${
                  isActive
                    ? 'liquid-glass-active scale-[1.03]'
                    : 'liquid-glass-inactive scale-100 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform duration-300 ${
                    isActive ? 'scale-110 text-white' : 'scale-100'
                  }`}
                />
                <span className="text-[10px] sm:text-xs font-semibold tracking-tight">
                  {tab.label}
                </span>
              </button>
            );
          })}

          {/* Integrated Gemini Coach Tab */}
          <button
            type="button"
            data-testid="bottom-nav-coach"
            aria-label="Coach — Ask Gemini Coach"
            aria-expanded={isCoachOpen}
            onClick={() => {
              triggerTabPop('coach');
              setIsCoachOpen((prev) => !prev);
            }}
            className={`focus-ring-tactile min-h-[44px] min-w-[44px] px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-95 whitespace-nowrap shrink-0 ${
              poppingTab === 'coach' ? 'animate-nav-pop' : ''
            } ${
              isCoachOpen
                ? 'liquid-glass-coach-active scale-[1.03]'
                : 'liquid-glass-coach-idle scale-100'
            }`}
          >
            <Bot
              className={`w-4 h-4 shrink-0 transition-transform duration-300 ${
                isCoachOpen ? 'text-white scale-110' : 'text-rose-400 scale-100'
              }`}
            />
            <span className="text-[10px] sm:text-xs font-semibold tracking-tight">
              Coach
            </span>
          </button>
        </div>
      </nav>

      {/* Modals & Drawers */}
      {activeWorkoutIndex !== null && (
        <LiveWorkoutModal
          exercises={exercises}
          activeIndex={activeWorkoutIndex}
          completedIds={completedExercises}
          onSelectExercise={(idx) => setActiveWorkoutIndex(idx)}
          onToggleComplete={handleToggleExerciseComplete}
          onStartTimer={startSessionTimerIfNeeded}
          onClose={() => setActiveWorkoutIndex(null)}
        />
      )}

      <GeminiCoachDrawer
        isOpen={isCoachOpen}
        onClose={() => setIsCoachOpen(false)}
        profile={profile}
        activeStreak={streakStats.activeStreak}
        messages={chatMessages}
        onUpdateMessages={setChatMessages}
      />

      <BaselineOnboardingModal
        isOpen={showOnboardingModal}
        initialProfile={profile}
        onSaveProfile={handleSaveOnboarding}
        onClose={() => setShowOnboardingModal(false)}
      />

      <SettingsBackupModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        profile={profile}
        calendarDays={calendarDays}
        completedExercises={completedExercises}
        prepChecklist={prepChecklist}
        onOpenRecalibrate={() => setShowOnboardingModal(true)}
        onOpenChangeAvatar={() => setShowChangeAvatarModal(true)}
        onUpdateHeightUnit={handleSetHeightUnit}
        onImportState={(payload) => {
          setProfile(payload.profile);
          setCalendarDays(payload.calendarDays);
          if (payload.completedExercises) setCompletedExercises(payload.completedExercises);
          if (payload.prepChecklist) setPrepChecklist(payload.prepChecklist);
        }}
        onResetAllData={handleResetAllData}
      />

      <ChangeProfilePicModal
        isOpen={showChangeAvatarModal}
        onClose={() => setShowChangeAvatarModal(false)}
        currentAvatarUrl={profile.avatarUrl}
        athleteName={profile.name}
        onSaveAvatar={handleSaveAvatar}
      />

      <WorkoutShareCardModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        profile={profile}
        activeStreak={streakStats.activeStreak}
        totalCompleted={streakStats.totalCompleted}
        sessionElapsedSeconds={
          calendarDays.find((d) => d.isToday)?.durationSeconds || sessionElapsedSeconds
        }
        postWorkoutProteinGrams={proteinTargets.postWorkoutGrams}
        todayDateLabel={calendarDays.find((d) => d.isToday)?.dateLabel || 'Today'}
      />

      <LogDurationModal
        isOpen={logDurationDayNumber !== null}
        onClose={() => setLogDurationDayNumber(null)}
        calendarDays={calendarDays}
        initialDayNumber={logDurationDayNumber ?? 12}
        currentElapsedSeconds={sessionElapsedSeconds}
        onSaveDuration={handleSaveDayDuration}
      />
    </div>
  );
}
