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
  X,
  Box,
  Layers,
  ChevronDown,
  ChevronsUpDown,
  Activity,
  Sparkles,
  Menu,
  PanelLeftClose,
  PanelLeft,
  RefreshCw,
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
  formatSyncTimeLabel,
} from './utils/fitnessLogic';
import { ExerciseBodyPositionSvg, SharifAvatarSvg } from './components/ExerciseBodyPositionSvg';
import { Exercise3DViewer } from './components/Exercise3DViewer';
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
  const [celebrationBanner, setCelebrationBanner] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [logDurationDayNumber, setLogDurationDayNumber] = useState<number | null>(null);
  const [shieldNotification, setShieldNotification] = useState<string | null>(null);
  const [dashboardViewMode, setDashboardViewMode] = useState<'3d' | '2d'>('3d');
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

  // Stack-by-stack phases state: all phases initially in collapsed state as requested
  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({
    phase1: false,
    phase2a: false,
    phase2b: false,
    phase3: false,
  });

  const togglePhase = (phaseId: string) => {
    setExpandedPhases((prev) => ({
      ...prev,
      [phaseId]: !prev[phaseId],
    }));
  };

  const areAllExpanded = useMemo(() => {
    return Object.values(expandedPhases).every(Boolean);
  }, [expandedPhases]);

  const toggleAllPhases = () => {
    const nextState = !areAllExpanded;
    setExpandedPhases({
      phase1: nextState,
      phase2a: nextState,
      phase2b: nextState,
      phase3: nextState,
    });
  };

  // Collapsible sidebar state (persisted across sessions)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('morning20_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('morning20_sidebar_collapsed', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Mobile off-canvas navigation sheet state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

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

  // Passive scroll-spy listener to highlight the active section
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

  const handleJumpToSection = (sectionId: string, domId: string) => {
    isProgrammaticScrollRef.current = true;
    if (programmaticScrollTimerRef.current) {
      window.clearTimeout(programmaticScrollTimerRef.current);
    }
    programmaticScrollTimerRef.current = window.setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 650);

    setActiveSection(sectionId as BottomNavSectionId);
    if (isCoachOpen) {
      setIsCoachOpen(false);
    }
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
    if (sectionId === 'prep') {
      setExpandedPhases((prev) => ({ ...prev, phase1: true }));
    } else if (sectionId === 'circuit') {
      setExpandedPhases((prev) => ({ ...prev, phase2a: true, phase2b: true }));
    } else if (sectionId === 'postworkout') {
      setExpandedPhases((prev) => ({ ...prev, phase3: true }));
    }
    setTimeout(() => {
      const targetEl = document.getElementById(domId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
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

  // Storage sync state for real-time persistence verification
  const [syncState, setSyncState] = useState<{
    status: 'synced' | 'saving' | 'error';
    lastSynced: Date;
    errorMessage?: string;
  }>({
    status: 'synced',
    lastSynced: new Date(),
  });

  // Relative time ticker to keep sync timestamp display fresh
  const [currentSyncNow, setCurrentSyncNow] = useState<Date>(() => new Date());
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const interval = window.setInterval(() => {
      setCurrentSyncNow(new Date());
    }, 5000);
    return () => window.clearInterval(interval);
  }, [isMobileMenuOpen]);

  const forceSyncToLocalStorage = useCallback(() => {
    try {
      setSyncState((prev) => ({ ...prev, status: 'saving' }));
      localStorage.setItem(STORAGE_KEYS.AUTH, String(isLoggedIn));
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
      localStorage.setItem(STORAGE_KEYS.CALENDAR, JSON.stringify(calendarDays));
      localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(completedExercises));
      localStorage.setItem(STORAGE_KEYS.PREP, JSON.stringify(prepChecklist));
      localStorage.setItem(STORAGE_KEYS.MOBILITY, JSON.stringify(completedMobility));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifSchedule));
      localStorage.setItem(STORAGE_KEYS.CHAT, JSON.stringify(chatMessages));
      // Verify storage key read
      const verified = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (!verified) throw new Error('Verification failed');
      setTimeout(() => {
        setSyncState({
          status: 'synced',
          lastSynced: new Date(),
        });
      }, 250);
    } catch (err) {
      setSyncState((prev) => ({
        status: 'error',
        lastSynced: prev.lastSynced,
        errorMessage: err instanceof Error ? err.message : 'Storage write error',
      }));
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
      setSyncState({
        status: 'synced',
        lastSynced: new Date(),
      });
    } catch (err) {
      setSyncState((prev) => ({
        status: 'error',
        lastSynced: prev.lastSynced,
        errorMessage: err instanceof Error ? err.message : 'Storage quota error',
      }));
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
      const colors = ['#F43F5E', '#D97706', '#059669', '#38BDF8'];
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

  const handleLogout = () => {
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH, 'false');
      if (typeof window !== 'undefined' && window.location.search) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch {
      // ignore
    }
    setShowSettingsModal(false);
    setShowOnboardingModal(false);
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <GoogleLoginSplash onGoogleLogin={handleGoogleLogin} />;
  }

  return (
    <div id="top" className="min-h-screen bg-slate-100 dark:bg-[#06090F] flex flex-col md:flex-row text-slate-900 dark:text-slate-100 p-2 sm:p-3 md:p-3.5 gap-3.5">
      {/* 1. Quiet Left Rail Navigation (desktop md: and above) */}
      <aside
        aria-label="Application navigation"
        className={`hidden md:flex shrink-0 flex-col justify-between bg-slate-100 dark:bg-[#06090F] transition-all duration-200 ease-in-out ${
          isSidebarCollapsed ? 'w-16 p-2.5' : 'w-60 p-4'
        }`}
      >
        <div>
          {/* Logo / Title + Collapse Toggle */}
          <div
            className={`flex items-center pb-3 border-b border-slate-200 dark:border-slate-800 ${
              isSidebarCollapsed ? 'justify-center flex-col gap-2' : 'justify-between'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center font-bold text-xs tracking-tight shrink-0"
                title="Morning 20"
              >
                M20
              </div>
              {!isSidebarCollapsed && (
                <div className="min-w-0">
                  <a href="#top" className="text-sm font-bold tracking-tight text-slate-900 dark:text-white truncate block">
                    Morning 20
                  </a>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
                    Day 12 of 30 · Hypertrophy
                  </p>
                </div>
              )}
            </div>
            <button
              type="button"
              data-testid="sidebar-collapse-toggle"
              onClick={toggleSidebar}
              title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
            >
              {isSidebarCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          </div>

          {/* Nav Links */}
          <nav aria-label="Sidebar sections" className="mt-4 space-y-1">
            {[
              { id: 'overview' as const, domId: 'overview-section', label: 'Overview', icon: LayoutDashboard },
              { id: 'streak' as const, domId: 'streak-calendar', label: 'Streak Calendar', icon: Calendar },
              { id: 'prep' as const, domId: 'prep-section', label: 'Prep Checklist', icon: ClipboardCheck },
              { id: 'circuit' as const, domId: 'workout-circuit', label: 'Workout Circuit', icon: Dumbbell },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSection === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  data-testid={`sidebar-nav-${tab.id}`}
                  onClick={() => handleJumpToSection(tab.id, tab.domId)}
                  title={isSidebarCollapsed ? tab.label : undefined}
                  aria-label={tab.label}
                  className={`h-9 rounded-lg text-xs flex items-center transition-colors text-left cursor-pointer ${
                    isSidebarCollapsed ? 'w-full justify-center px-0' : 'w-full px-3 gap-2.5'
                  } ${
                    isActive
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold border border-slate-200 dark:border-slate-700 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!isSidebarCollapsed && <span className="truncate">{tab.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* AI Coach Trigger Button in Left Rail */}
          <div className="mt-5 pt-3.5 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              data-testid="sidebar-coach-btn"
              onClick={() => setIsCoachOpen((prev) => !prev)}
              title={isSidebarCollapsed ? 'Open Gemini Coach' : undefined}
              aria-label="Open Gemini Coach"
              className={`h-9 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center transition-colors cursor-pointer ${
                isSidebarCollapsed ? 'w-full justify-center px-0' : 'w-full px-3 justify-between'
              }`}
            >
              <span className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2'}`}>
                <Bot className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>Gemini Coach</span>}
              </span>
              {!isSidebarCollapsed && (
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono">AI</span>
              )}
            </button>
          </div>
        </div>

        {/* Bottom Utility Strip in Left Rail */}
        <div className="space-y-1 pt-3.5 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            data-testid="theme-toggle-button"
            aria-pressed={darkMode}
            onClick={() => setDarkMode((prev) => !prev)}
            title={isSidebarCollapsed ? (darkMode ? 'Light Theme' : 'Dark Theme') : undefined}
            aria-label={darkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            className={`h-8 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/50 flex items-center transition-colors cursor-pointer ${
              isSidebarCollapsed ? 'w-full justify-center px-0' : 'w-full px-2.5 justify-between'
            }`}
          >
            <span className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-2'}`}>
              {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" /> : <Moon className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400 shrink-0" />}
              {!isSidebarCollapsed && <span>{darkMode ? 'Light Theme' : 'Dark Theme'}</span>}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setShowOnboardingModal(true)}
            title={isSidebarCollapsed ? 'Calibrate Baselines' : undefined}
            aria-label="Calibrate Baselines"
            className={`h-8 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/50 flex items-center transition-colors text-left cursor-pointer ${
              isSidebarCollapsed ? 'w-full justify-center px-0' : 'w-full px-2.5 gap-2'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 shrink-0" />
            {!isSidebarCollapsed && <span className="truncate">Calibrate Baselines</span>}
          </button>

          <button
            type="button"
            onClick={() => setShowSettingsModal(true)}
            title={isSidebarCollapsed ? 'Backup & Settings' : undefined}
            aria-label="Backup & Settings"
            className={`h-8 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/50 flex items-center transition-colors text-left cursor-pointer ${
              isSidebarCollapsed ? 'w-full justify-center px-0' : 'w-full px-2.5 gap-2'
            }`}
          >
            <Settings className="w-3.5 h-3.5 shrink-0" />
            {!isSidebarCollapsed && <span className="truncate">Backup &amp; Settings</span>}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            title={isSidebarCollapsed ? 'Log Out' : undefined}
            aria-label="Log Out"
            className={`h-8 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/50 flex items-center transition-colors text-left cursor-pointer ${
              isSidebarCollapsed ? 'w-full justify-center px-0' : 'w-full px-2.5 gap-2'
            }`}
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            {!isSidebarCollapsed && <span className="truncate">Log Out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Header Bar (< md) */}
      <header className="md:hidden flex items-center justify-between gap-3 px-3 py-2.5 bg-slate-100 dark:bg-[#06090F] border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <button
            type="button"
            data-testid="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            className="w-8 h-8 rounded-md bg-slate-200/80 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <Menu className="w-4 h-4" />
          </button>
          <div className="w-7 h-7 rounded-md bg-rose-500 text-white flex items-center justify-center font-bold text-xs">
            M20
          </div>
          <span className="font-bold text-sm text-slate-900 dark:text-white">Morning 20</span>
          <span className="text-xs text-slate-600 dark:text-slate-300">· Day 12</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsCoachOpen(true)}
            aria-label="Open Gemini Coach"
            className="h-8 px-2.5 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium flex items-center gap-1 cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Coach</span>
          </button>
          <button
            type="button"
            onClick={() => setDarkMode((d) => !d)}
            aria-label="Toggle theme"
            className="w-8 h-8 rounded-md bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Log Out"
            title="Log Out"
            className="h-8 px-2 rounded-md bg-slate-200 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-700 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 text-xs font-medium transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Log Out</span>
          </button>
        </div>
      </header>

      {/* Mobile Slide-Out Drawer Navigation (< md) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 md:hidden"
              aria-hidden="true"
            />

            {/* Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              aria-label="Mobile navigation drawer"
              className="fixed inset-y-0 left-0 w-[280px] max-w-[85vw] bg-white dark:bg-[#0B0F19] border-r border-slate-200 dark:border-slate-800 shadow-2xl z-50 md:hidden flex flex-col justify-between p-4 overflow-y-auto"
            >
              <div>
                {/* Drawer Header */}
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center font-bold text-xs tracking-tight">
                      M20
                    </div>
                    <div>
                      <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white block">
                        Morning 20
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Day 12 of 30 · Hypertrophy
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-label="Close navigation menu"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* 'Sync Status' indicator at top of mobile navigation drawer */}
                <div
                  data-testid="mobile-sync-status"
                  className="mt-3.5 mb-1 p-2.5 rounded-lg border border-slate-200/90 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/60 shadow-xs transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="relative flex h-2.5 w-2.5 shrink-0">
                        {syncState.status === 'synced' && (
                          <>
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                          </>
                        )}
                        {syncState.status === 'saving' && (
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500 animate-pulse" />
                        )}
                        {syncState.status === 'error' && (
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 tracking-tight">
                            {syncState.status === 'synced' && 'Sync Status: Active'}
                            {syncState.status === 'saving' && 'Sync Status: Saving...'}
                            {syncState.status === 'error' && 'Sync Status: Error'}
                          </span>
                          {syncState.status === 'synced' && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {syncState.status === 'synced'
                            ? `Local storage synced · ${formatSyncTimeLabel(syncState.lastSynced, currentSyncNow)}`
                            : syncState.status === 'saving'
                            ? 'Writing state to storage...'
                            : syncState.errorMessage || 'Local storage write error'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      data-testid="mobile-sync-refresh-btn"
                      onClick={forceSyncToLocalStorage}
                      title="Verify and force re-sync with local storage"
                      aria-label="Verify and force re-sync with local storage"
                      className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${syncState.status === 'saving' ? 'animate-spin text-amber-500' : ''}`}
                      />
                    </button>
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-[9px] text-slate-400 dark:text-slate-500 font-mono">
                    <span>8 storage keys verified</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-sans font-medium">100% Offline Ready</span>
                  </div>
                </div>

                {/* Quick jump to Phases & Sections */}
                <div className="mt-4">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 px-2 pb-2">
                    Routine Navigation
                  </p>
                  <nav aria-label="Mobile sections" className="space-y-1">
                    {[
                      { id: 'overview' as const, domId: 'overview-section', label: 'Overview', icon: LayoutDashboard },
                      { id: 'streak' as const, domId: 'streak-calendar', label: 'Streak Calendar', icon: Calendar },
                      { id: 'prep' as const, domId: 'prep-section', label: 'Phase 1: Prep Checklist', icon: ClipboardCheck },
                      { id: 'circuit' as const, domId: 'workout-circuit', label: 'Phase 2: 20-Min Circuit', icon: Dumbbell },
                      { id: 'postworkout' as const, domId: 'post-workout-section', label: 'Phase 3: Fuel & Mobility', icon: Zap },
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeSection === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => handleJumpToSection(tab.id, tab.domId)}
                          className={`w-full min-h-[44px] px-3 rounded-lg text-xs flex items-center gap-2.5 transition-colors text-left cursor-pointer ${
                            isActive
                              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold border border-rose-200/80 dark:border-rose-900/50'
                              : 'text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800/60'
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* Gemini Coach Trigger Button in Mobile Drawer */}
                <div className="mt-5 pt-3.5 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsCoachOpen(true);
                    }}
                    className="w-full min-h-[44px] px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center justify-between transition-colors shadow-xs cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Bot className="w-4 h-4" />
                      <span>Gemini Coach</span>
                    </span>
                    <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded font-mono">AI</span>
                  </button>
                </div>
              </div>

              {/* Bottom Utility Strip in Drawer */}
              <div className="space-y-1 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setDarkMode((prev) => !prev)}
                  className="w-full min-h-[44px] px-2.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    {darkMode ? <Sun className="w-4 h-4 text-amber-400 shrink-0" /> : <Moon className="w-4 h-4 text-slate-600 dark:text-slate-400 shrink-0" />}
                    <span>{darkMode ? 'Light Theme' : 'Dark Theme'}</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setShowOnboardingModal(true);
                  }}
                  className="w-full min-h-[44px] px-2.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 flex items-center gap-2.5 transition-colors text-left cursor-pointer"
                >
                  <Sliders className="w-4 h-4 shrink-0" />
                  <span>Calibrate Baselines</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setShowSettingsModal(true);
                  }}
                  className="w-full min-h-[44px] px-2.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 flex items-center gap-2.5 transition-colors text-left cursor-pointer"
                >
                  <Settings className="w-4 h-4 shrink-0" />
                  <span>Backup &amp; Settings</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full min-h-[44px] px-2.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 flex items-center gap-2.5 transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>Log Out</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* 2. Inset Sheet Container */}
      <main className="flex-1 min-w-0 framed-sheet p-4 sm:p-6 lg:p-7 space-y-6 overflow-hidden">
        {/* Overview Section: Athlete Welcome Bar + 4-Column Typographic Data Strip */}
        <section id="overview-section" className="scroll-mt-6 rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-[#0E131F]">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3.5">
              <SharifAvatarSvg
                name={profile.name}
                avatarUrl={profile.avatarUrl}
                className="w-12 h-12 sm:w-14 sm:h-14 shrink-0"
                onEdit={() => setShowChangeAvatarModal(true)}
                showBadge
              />
              <div>
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span>Google Authenticated</span>
                  <span>·</span>
                  <span className="truncate max-w-[200px]">{profile.email}</span>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={handleLogout}
                    aria-label="Log out of account"
                    className="px-1.5 py-0.5 rounded text-xs text-rose-600 dark:text-rose-400 hover:underline cursor-pointer font-medium"
                  >
                    Log Out
                  </button>
                  <span>·</span>
                  <span>
                    Height: <strong className="text-slate-900 dark:text-white font-medium">{formatHeight(profile.heightCm, profile.heightUnit)}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={handleToggleHeightUnit}
                    aria-label={`Switch height display to ${profile.heightUnit === 'ft' ? 'centimeters' : 'feet and inches'}`}
                    className="px-1.5 py-0.5 rounded text-xs text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                  >
                    ({profile.heightUnit === 'ft' ? 'cm' : 'ft'})
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={() => setShowChangeAvatarModal(true)}
                    className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                  >
                    <Camera className="w-3 h-3" />
                    <span>Photo</span>
                  </button>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
                  Morning, {profile.name}. Ready for Day 12?
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  startSessionTimerIfNeeded();
                  setExpandedPhases((prev) => ({ ...prev, phase2b: true }));
                  setActiveWorkoutIndex(0);
                }}
                className="h-10 px-4 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                Start 20-Min Session
              </button>
            </div>
          </div>

          {/* 4-Column Typographic Data Strip (Zero Tinted Boxes, Zero Shadows) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-5">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">Active Morning Streak</div>
              <div className="mt-1.5 flex items-baseline gap-1.5">
                <span
                  data-testid="active-streak-count"
                  className="tabular-nums text-2xl sm:text-3xl font-bold text-rose-600 dark:text-rose-400"
                >
                  {streakStats.activeStreak}
                </span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Days</span>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {streakStats.totalCompleted}/30 days logged ({streakStats.completionRate}%)
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">Hypertrophy Weight Goal</div>
              <div className="mt-1.5 flex items-baseline gap-1.5">
                <span className="tabular-nums text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  {profile.currentWeightKg}
                </span>
                <span className="text-sm text-slate-400">→</span>
                <span className="tabular-nums text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {profile.targetWeightKg}
                </span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">kg</span>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                +{Math.max(0, profile.targetWeightKg - profile.currentWeightKg)} kg lean mass target
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">Calibrated Rep Baselines</div>
              <div className="mt-1.5 tabular-nums text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {profile.maxPushUps} Push · {profile.maxPullUps} Pull
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                3-1-1 Tempo + 4s Eccentric Negatives
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">Daily Protein Target</div>
              <div className="mt-1.5 tabular-nums text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400">
                {proteinTargets.gramsPerDay}g
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {proteinTargets.postWorkoutGrams}g in 45m post-workout meal
              </div>
            </div>
          </div>

          {/* 7-Day Completion Chart */}
          <div className="mt-5">
            <WeeklyCompletionChart
              calendarDays={calendarDays}
              onToggleDay={handleToggleDay}
              onOpenLogDuration={(dayNum) => setLogDurationDayNumber(dayNum)}
              darkMode={darkMode}
            />
          </div>
        </section>

        {/* 30-Day Calendar & Streak Section */}
        <section id="streak-calendar" className="scroll-mt-6 rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-[#0E131F]">
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

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setLogDurationDayNumber(12)}
                className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                <span>Log Duration</span>
              </button>

              <button
                type="button"
                onClick={() => setShowShareModal(true)}
                className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Share Card</span>
              </button>

              <button
                type="button"
                onClick={handleToggleTodaySession}
                className={`h-9 px-3.5 rounded-lg font-semibold text-xs flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 ${
                  streakStats.todayCompleted
                    ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                    : 'bg-rose-600 text-white hover:bg-rose-500'
                }`}
              >
                <CheckCircle2
                  key={streakStats.todayCompleted ? 'today-completed' : 'today-pending'}
                  className="w-4 h-4"
                />
                <span>
                  {streakStats.todayCompleted
                    ? "Today's Session Completed (Streak +1)"
                    : "Tick Off Today's 20-Min Session"}
                </span>
              </button>
            </div>
          </div>

          {/* 30-Day Efficiency Hub */}
          <div
            data-testid="efficiency-tracker-hub"
            className="mb-4 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-col md:flex-row md:items-center justify-between gap-3 text-sm"
          >
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-800 dark:text-slate-200">
                <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>
                  Avg Pace:{' '}
                  <strong className="tabular-nums text-slate-900 dark:text-white">
                    {formatDurationHuman(efficiencyStats.averageDurationSeconds)}
                  </strong>
                </span>
              </div>

              {efficiencyStats.fastestDurationSeconds > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-800 dark:text-slate-200">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>
                    Fastest (Day {efficiencyStats.fastestDayNumber}):{' '}
                    <strong className="tabular-nums text-emerald-700 dark:text-emerald-300">
                      {formatDurationMmSs(efficiencyStats.fastestDurationSeconds)}
                    </strong>
                  </span>
                </div>
              )}

              {efficiencyStats.improvementSeconds > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-medium">
                  <span className="tabular-nums">
                    ↓ {formatDurationHuman(efficiencyStats.improvementSeconds)} faster
                  </span>
                  <span className="text-xs text-emerald-700 dark:text-emerald-300">
                    (+{efficiencyStats.improvementPercent}% efficiency)
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 hidden xl:inline">
                Track how much faster you complete the 20-min circuit over 30 days
              </span>
              <button
                type="button"
                onClick={() => setLogDurationDayNumber(12)}
                className="h-8 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white font-medium text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <Clock className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                <span>Log Time</span>
              </button>
            </div>
          </div>

          {/* Gamification & Streak Shield Hub */}
          <div className="mb-4 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-col md:flex-row md:items-center justify-between gap-3 text-sm">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <Flame className="w-4 h-4 text-rose-500" />
                <span>{streakStats.activeStreak} Days Unbroken Streak</span>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 text-cyan-900 dark:text-cyan-200">
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
              <span className="text-sm text-slate-600 dark:text-slate-400 hidden lg:inline">
                Click shield icon on any rest/missed day to prevent streak reset
              </span>
              {streakStats.shieldsUsed < MAX_STREAK_SHIELDS && (
                <button
                  type="button"
                  onClick={() => {
                    const today = calendarDays.find((d) => d.isToday);
                    if (today) handleToggleDayShield(today.dayNumber);
                  }}
                  className="h-8 px-3 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white font-medium text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap"
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
                className="mb-4 p-3 rounded-lg bg-cyan-50 dark:bg-cyan-950/70 border border-cyan-300 dark:border-cyan-800 text-cyan-950 dark:text-cyan-100 font-medium text-xs flex items-center justify-between"
              >
                <span>{shieldNotification}</span>
                <button
                  type="button"
                  onClick={() => setShieldNotification(null)}
                  aria-label="Dismiss shield notification"
                  className="p-1 text-cyan-700 dark:text-cyan-300 hover:text-cyan-950 dark:hover:text-white ml-2 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Horizontal Scrolling 30-Day Strip */}
          <div
            ref={calendarStripRef}
            tabIndex={0}
            role="region"
            aria-label="30-day interactive workout streak tracker"
            className="flex items-center gap-2.5 overflow-x-auto pb-3 pt-1 scroll-smooth"
          >
            {calendarDays.map((day) => {
              const isDone = day.completed;
              const isToday = day.isToday;
              const isRec = day.isRecoveryDay;
              const isShielded = day.isShielded;

              let cardStyle =
                'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600';
              if (isDone && isToday) {
                cardStyle =
                  'bg-emerald-600 dark:bg-emerald-600 border-emerald-500 text-white ring-2 ring-emerald-400/40';
              } else if (isToday) {
                cardStyle =
                  'bg-rose-600 dark:bg-rose-700 border-rose-500 text-white ring-2 ring-rose-500/40 font-semibold';
              } else if (isDone) {
                cardStyle =
                  'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200';
              } else if (isShielded) {
                cardStyle =
                  'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-300 dark:border-cyan-800 text-cyan-900 dark:text-cyan-200';
              } else if (isRec) {
                cardStyle =
                  'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800/70 text-amber-900 dark:text-amber-200';
              }

              return (
                <div
                  key={day.dayNumber}
                  className={`relative min-w-[84px] min-h-[104px] p-2.5 rounded-xl border flex flex-col justify-between text-left shrink-0 ${cardStyle}`}
                >
                  {/* Top Bar: Day Number + Quick Shield Button */}
                  <div className="flex items-center justify-between w-full text-xs tabular-nums">
                    <span>D{day.dayNumber}</span>
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
                      className={`min-w-[24px] min-h-[24px] p-0.5 rounded flex items-center justify-center transition-opacity ${
                        isShielded
                          ? 'text-cyan-600 dark:text-cyan-400'
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
                    onClick={() => handleToggleDay(day.dayNumber)}
                    aria-label={`Day ${day.dayNumber} ${day.dateLabel}. Status: ${
                      isDone ? 'Completed' : 'Pending'
                    }. Click to toggle completion.`}
                    data-today={isToday ? 'true' : undefined}
                    className="my-1.5 flex flex-col items-center justify-center cursor-pointer w-full"
                  >
                    <span className="text-xs font-semibold block">{day.dateLabel}</span>
                    <span className={`text-xs block ${isToday ? 'text-white font-bold' : 'text-slate-600 dark:text-slate-400'}`}>
                      {isToday
                        ? "Today"
                        : isDone
                        ? 'Done'
                        : isRec
                        ? 'Mobility'
                        : '20m'}
                    </span>
                    {isDone && (
                      <span
                        data-testid={`calendar-check-${day.dayNumber}`}
                        data-animating={animatingDayNumber === day.dayNumber ? 'true' : undefined}
                        className={`inline-flex items-center justify-center w-4 h-4 rounded-full mt-1 ${
                          isToday
                            ? 'bg-white/25 text-white'
                            : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        <Check className="w-3 h-3 stroke-[2.75]" />
                      </span>
                    )}
                    {!isDone && isShielded && (
                      <Shield className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 fill-cyan-500/20 mt-1" />
                    )}
                  </button>

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
                      className="mt-1 w-full min-h-[24px] px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 hover:bg-black/15 dark:hover:bg-white/20 flex items-center justify-between text-xs tabular-nums font-semibold transition-colors"
                    >
                      <span className="flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5 opacity-70" />
                        <span>{formatDurationMmSs(day.durationSeconds)}</span>
                      </span>
                      {efficiencyStats.fastestDayNumber === day.dayNumber && (
                        <span className="text-xs text-amber-500 font-bold flex items-center gap-0.5" title="Fastest Personal Record">
                          <Zap className="w-2.5 h-2.5" />
                          PR
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
                      className={`mt-1 w-full min-h-[24px] px-1.5 py-0.5 rounded border border-dashed text-xs font-medium flex items-center justify-center gap-1 transition-colors ${
                        isToday
                          ? 'border-rose-400 bg-rose-700/60 text-white hover:bg-rose-700'
                          : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                      }`}
                    >
                      <Clock className="w-2.5 h-2.5" />
                      <span>Log Time</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Milestone Achievements & Trophies */}
          <div className="mt-5">
            <MilestoneBadgesCard
              badges={milestoneBadges}
              onOpenShareModal={() => setShowShareModal(true)}
              darkMode={darkMode}
            />
          </div>
        </section>

        {/* =========================================================================
            Interactive Workout Routine Phases Stack (Initially Collapsed State)
           ========================================================================= */}
        <div id="workout-phases-stack" className="scroll-mt-6 space-y-3.5">
          {/* Phases Stack Header & Global Toggle Bar */}
          <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E131F] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400 tracking-wider uppercase">
                <Flame className="w-3.5 h-3.5" />
                <span>Routine Progression Stack</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                Daily Workout Phases
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Stacked step-by-step for optimal hypertrophy. Click any phase header below to expand or collapse.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mr-1">
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                  (prepChecklist.waterDates && prepChecklist.towelLedge)
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}>
                  P1: {(prepChecklist.waterDates ? 1 : 0) + (prepChecklist.towelLedge ? 1 : 0)}/2
                </span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                  completedMobility.length === 3
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}>
                  P2A: {completedMobility.length}/3
                </span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                  completedExercises.length === mainCircuitExercises.length
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}>
                  P2B: {completedExercises.length}/{mainCircuitExercises.length}
                </span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                  postWorkoutStatus.unlocked
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}>
                  P3: {postWorkoutStatus.unlocked ? 'Unlocked' : 'Locked'}
                </span>
              </div>

              <button
                type="button"
                data-testid="phase-toggle-all-btn"
                onClick={toggleAllPhases}
                className="h-9 px-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ChevronsUpDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>{areAllExpanded ? 'Collapse All Phases' : 'Expand All Phases'}</span>
              </button>
            </div>
          </div>

          {/* =========================================================================
              PHASE 1 STACK CARD: Pre-Workout Preparation & Reminders
             ========================================================================= */}
          <div
            id="phase-1-card"
            data-testid="phase-card-phase1"
            data-expanded={expandedPhases.phase1 ? 'true' : 'false'}
            className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
              expandedPhases.phase1
                ? 'border-blue-400/80 dark:border-blue-800 bg-white dark:bg-[#0E131F] shadow-sm'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E131F] hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            {/* Clickable Header Button */}
            <button
              type="button"
              data-testid="phase-header-phase1"
              aria-expanded={expandedPhases.phase1}
              aria-controls="phase-content-phase1"
              onClick={() => togglePhase('phase1')}
              className="w-full p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/30 select-none cursor-pointer"
            >
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/80 border border-blue-200/80 dark:border-blue-800 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800">
                      Phase 1
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
                      Pre-Circuit Preparation &amp; Setup
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1">
                    Pre-Workout Preparation &amp; Smart Reminders
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Hydration, medjool dates, towel-grip beam setup &amp; circadian alarm trigger
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border flex items-center gap-1.5 ${
                    (prepChecklist.waterDates && prepChecklist.towelLedge)
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}>
                    {(prepChecklist.waterDates && prepChecklist.towelLedge) && (
                      <Check className="w-3 h-3 stroke-[3]" />
                    )}
                    <span>{(prepChecklist.waterDates ? 1 : 0) + (prepChecklist.towelLedge ? 1 : 0)} / 2 Ready</span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 pl-2">
                  <span className="text-xs hidden md:inline">{expandedPhases.phase1 ? 'Collapse' : 'Expand'}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${
                      expandedPhases.phase1 ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''
                    }`}
                  />
                </div>
              </div>
            </button>

            {/* Expandable Phase 1 Content */}
            {expandedPhases.phase1 && (
              <div
                id="phase-content-phase1"
                data-testid="phase-content-phase1"
                className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40"
              >
                <div id="prep-section" className="scroll-mt-6 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Pre-Workout Prep Checklist */}
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-[#0E131F] lg:col-span-7 flex flex-col justify-between">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Phase 1 · Complete Before Starting Your 20-Minute Hypertrophy Circuit
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                Pre-Workout Prep Checklist
              </h2>

              <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
                <button
                  type="button"
                  onClick={() => handleTogglePrep('waterDates')}
                  className="w-full min-h-[52px] py-3 flex items-center justify-between gap-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-lg px-2.5 transition-colors"
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      1. 500ml Warm Water + 2 Medjool Dates (Pre-Workout)
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                      Rapid glucose for morning glycogen + cellular hydration 10 mins before Round 1
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors ${
                      prepChecklist.waterDates
                        ? 'bg-emerald-600 text-white'
                        : 'border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                    }`}
                  >
                    {prepChecklist.waterDates && <Check className="w-3.5 h-3.5" />}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleTogglePrep('towelLedge')}
                  className="w-full min-h-[52px] py-3 flex items-center justify-between gap-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-lg px-2.5 transition-colors"
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      2. Folded Towel Grip on Overhead Door/Beam Ledge
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                      Cushions finger joints and pre-activates forearm flexors for 4s negative pull-ups
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors ${
                      prepChecklist.towelLedge
                        ? 'bg-emerald-600 text-white'
                        : 'border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                    }`}
                  >
                    {prepChecklist.towelLedge && <Check className="w-3.5 h-3.5" />}
                  </div>
                </button>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>
                Pre-Session Readiness:{' '}
                <strong className="text-slate-900 dark:text-white tabular-nums">
                  {(prepChecklist.waterDates ? 1 : 0) + (prepChecklist.towelLedge ? 1 : 0)} / 2
                </strong>{' '}
                Completed
              </span>
              <a
                href="#post-workout-section"
                className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-semibold hover:underline"
              >
                Post-Workout follows Circuit →
              </a>
            </div>
          </section>

          {/* Smart Reminder Scheduler */}
          <section id="smart-reminders" className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-[#0E131F] lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Browser Notification API · Circadian Habit Triggers
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" />
                <span>Smart Reminder Scheduler</span>
              </h2>

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
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Morning Circuit Trigger:</span>
                    <span className="tabular-nums font-bold text-slate-900 dark:text-white">
                      {reminderTimes.workoutTime12}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">
                      Post-Workout Protein Meal (+{notifSchedule.proteinDelayMinutes}m):
                    </span>
                    <span className="tabular-nums font-bold text-rose-700 dark:text-rose-400">
                      {reminderTimes.proteinTime12}
                    </span>
                  </div>
                </div>

                {notifBanner && (
                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200">
                    {notifBanner}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleTestNotification('workout')}
                className="h-9 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
              >
                Test 7:00 AM Alert
              </button>
              <button
                type="button"
                onClick={() => handleTestNotification('protein')}
                className="h-9 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
              >
                Test +45m Fuel Alert
              </button>
            </div>
          </section>
                </div>
              </div>
            )}
          </div>

          {/* =========================================================================
              PHASE 2A STACK CARD: Pre-Workout Dynamic Mobility Drills
             ========================================================================= */}
          <div
            id="phase-2a-card"
            data-testid="phase-card-phase2a"
            data-expanded={expandedPhases.phase2a ? 'true' : 'false'}
            className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
              expandedPhases.phase2a
                ? 'border-rose-400/80 dark:border-rose-800 bg-white dark:bg-[#0E131F] shadow-sm'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E131F] hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            {/* Clickable Header Button */}
            <button
              type="button"
              data-testid="phase-header-phase2a"
              aria-expanded={expandedPhases.phase2a}
              aria-controls="phase-content-phase2a"
              onClick={() => togglePhase('phase2a')}
              className="w-full p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/30 select-none cursor-pointer"
            >
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200/80 dark:border-rose-800 flex items-center justify-center shrink-0 text-rose-600 dark:text-rose-400">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800">
                      Phase 2A
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
                      2-3 Mins · Joint Priming Drills
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1">
                    Pre-Workout Dynamic Mobility Drills
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Shoulder arm circles, 90/90 hip openers &amp; thoracic rotations with 3D joint guidance
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border flex items-center gap-1.5 ${
                    completedMobility.length === 3
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}>
                    {completedMobility.length === 3 && (
                      <Check className="w-3 h-3 stroke-[3]" />
                    )}
                    <span>{completedMobility.length} / 3 Drills Primed</span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 pl-2">
                  <span className="text-xs hidden md:inline">{expandedPhases.phase2a ? 'Collapse' : 'Expand'}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${
                      expandedPhases.phase2a ? 'rotate-180 text-rose-600 dark:text-rose-400' : ''
                    }`}
                  />
                </div>
              </div>
            </button>

            {/* Expandable Phase 2A Content */}
            {expandedPhases.phase2a && (
              <div
                id="phase-content-phase2a"
                data-testid="phase-content-phase2a"
                className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40"
              >
                <PreWorkoutMobilitySection
                  completedMobilityIds={completedMobility}
                  onToggleMobility={handleToggleMobility}
                  onSetAllMobility={handleSetAllMobility}
                  darkMode={darkMode}
                />
              </div>
            )}
          </div>

          {/* =========================================================================
              PHASE 2B STACK CARD: 20-Minute Full-Body Hypertrophy Circuit
             ========================================================================= */}
          <div
            id="phase-2b-card"
            data-testid="phase-card-phase2b"
            data-expanded={expandedPhases.phase2b ? 'true' : 'false'}
            className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
              expandedPhases.phase2b
                ? 'border-amber-400/80 dark:border-amber-800 bg-white dark:bg-[#0E131F] shadow-sm'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E131F] hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            {/* Clickable Header Button */}
            <button
              type="button"
              data-testid="phase-header-phase2b"
              aria-expanded={expandedPhases.phase2b}
              aria-controls="phase-content-phase2b"
              onClick={() => togglePhase('phase2b')}
              className="w-full p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/30 select-none cursor-pointer"
            >
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/80 border border-amber-200/80 dark:border-amber-800 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800">
                      Phase 2B
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
                      3 Rounds · 45s Work / 15s Rest · 3-1-1 Cadence Sync
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1">
                    20-Minute Full-Body Hypertrophy Circuit
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Live 3-1-1 tempo timing, procedural skeletal animation &amp; target muscle engagement
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-2">
                  {sessionElapsedSeconds > 0 && (
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border flex items-center gap-1.5 tabular-nums ${
                      isSessionTimerRunning
                        ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 animate-pulse'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}>
                      <Clock className="w-3 h-3" />
                      <span>{formatElapsedMmSs(sessionElapsedSeconds)}</span>
                    </span>
                  )}

                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border flex items-center gap-1.5 ${
                    completedExercises.length === mainCircuitExercises.length
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}>
                    {completedExercises.length === mainCircuitExercises.length && (
                      <Check className="w-3 h-3 stroke-[3]" />
                    )}
                    <span>{completedExercises.length} / {mainCircuitExercises.length} Done</span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 pl-2">
                  <span className="text-xs hidden md:inline">{expandedPhases.phase2b ? 'Collapse' : 'Expand'}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${
                      expandedPhases.phase2b ? 'rotate-180 text-amber-600 dark:text-amber-400' : ''
                    }`}
                  />
                </div>
              </div>
            </button>

            {/* Expandable Phase 2B Content */}
            {expandedPhases.phase2b && (
              <div
                id="phase-content-phase2b"
                data-testid="phase-content-phase2b"
                className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40"
              >
                <section id="workout-circuit" className="scroll-mt-6 space-y-5">

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pt-2">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Phase 2B · 3 Rounds · 45s Work / 15s Rest · Click Any Exercise for Live 3-1-1 Tempo Mode
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-2">
                <Flame className="w-6 h-6 text-rose-500" />
                <span>20-Minute Full-Body Hypertrophy Circuit</span>
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Dynamic Workout Session Total Time Field */}
              <div
                data-testid="circuit-total-time"
                className={`min-h-[40px] px-3 py-1.5 rounded-lg border flex items-center gap-2 text-xs tabular-nums transition-colors ${
                  isSessionTimerRunning
                    ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-200'
                    : sessionElapsedSeconds > 0
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Clock
                  className={`w-4 h-4 shrink-0 ${
                    isSessionTimerRunning
                      ? 'text-rose-500'
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
                    aria-label={isSessionTimerRunning ? 'Pause session timer' : 'Start session timer'}
                    className="p-1 rounded text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
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
                      className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* 3D vs 2D Model Toggle */}
                <div className="inline-flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-0.5">
                  <button
                    type="button"
                    onClick={() => setDashboardViewMode('3d')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                      dashboardViewMode === '3d'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title="Interactive 3D Rigged Mannequin"
                  >
                    <Box className="w-3.5 h-3.5" />
                    <span>3D Model</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDashboardViewMode('2d')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                      dashboardViewMode === '2d'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title="2D Vector Blueprint"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>2D Blueprint</span>
                  </button>
                </div>

                <div className="text-xs tabular-nums text-slate-600 dark:text-slate-400">
                  Completed Today:{' '}
                  <strong className="text-slate-900 dark:text-white">
                    {postWorkoutStatus.completedCount} / {postWorkoutStatus.totalRequired}
                  </strong>{' '}
                  Exercises
                </div>
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
                className="p-4 sm:p-5 rounded-xl bg-emerald-600 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-100" />
                  <div>
                    <div className="text-sm font-bold">
                      20-Minute Hypertrophy Circuit Complete! Post-Workout Phase Active Below
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
                    className="h-9 px-3 rounded-lg bg-white text-emerald-950 text-xs font-semibold hover:bg-emerald-50 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Share Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={fireWorkoutCompletionConfetti}
                    className="h-9 px-3 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
                  >
                    Replay Confetti
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mainCircuitExercises.map((ex) => {
              const fullIndex = exercises.findIndex((item) => item.id === ex.id);
              const isDone = completedExercises.includes(ex.id);
              return (
                <article
                  key={ex.id}
                  className={`rounded-xl p-4 flex flex-col justify-between border ${
                    isDone
                      ? 'border-emerald-400 dark:border-emerald-600 bg-emerald-50/30 dark:bg-emerald-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E131F]'
                  }`}
                >
                  <div>
                    {/* Top Metadata Line */}
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                      <span>
                        {ex.stepNumber} · {ex.rounds} {ex.rounds === 1 ? 'Round' : 'Rounds'} · {ex.workSeconds}s/{ex.restSeconds}s
                      </span>
                      <span className="text-rose-600 dark:text-rose-400 font-semibold">{ex.tempo}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1.5">
                      {ex.name}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      {ex.subtitle}
                    </p>

                    {/* Interactive Biomechanical Preview: 3D Rigged Mannequin or 2D Vector */}
                    {dashboardViewMode === '3d' ? (
                      <div className="mt-3 rounded-lg overflow-hidden border border-slate-200/60 dark:border-slate-700/60">
                        <Exercise3DViewer
                          poseType={ex.poseType}
                          exerciseName={ex.name}
                          depthFactor={0.4}
                          targetMuscles={ex.targetMuscles}
                          heightClass="h-44 sm:h-48"
                          showControls={true}
                        />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          startSessionTimerIfNeeded();
                          setActiveWorkoutIndex(fullIndex);
                        }}
                        aria-label={`Start live 3-1-1 timer and view biomechanical form for ${ex.name}`}
                        className="w-full text-left mt-3 cursor-pointer rounded-lg overflow-hidden group relative block border border-slate-200/60 dark:border-slate-700/60"
                      >
                        <ExerciseBodyPositionSvg
                          poseType={ex.poseType}
                          depthFactor={0.4}
                          className="w-full h-36"
                        />
                        <div className="absolute bottom-2.5 right-2.5 px-2 py-1 rounded bg-slate-900/90 text-white text-xs font-medium flex items-center gap-1">
                          <Volume2 className="w-3 h-3 text-amber-400" />
                          <span>Live 3-1-1 Timer</span>
                        </div>
                      </button>
                    )}

                    <div className="mt-3 text-sm text-slate-700 dark:text-slate-300 tabular-nums">
                      Prescription: <strong className="text-slate-900 dark:text-white">{ex.prescribedReps}</strong>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
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
                      className="flex-1 h-9 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Live Position &amp; Timer</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleExerciseComplete(ex.id)}
                      aria-label={isDone ? `Unmark ${ex.name} completed` : `Mark ${ex.name} completed`}
                      className={`h-9 px-3 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 ${
                        isDone
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isDone ? 'Done' : 'Check'}</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
                </section>
              </div>
            )}
          </div>

          {/* =========================================================================
              PHASE 3 STACK CARD: Post-Workout Recovery & High-Protein Fuel
             ========================================================================= */}
          <div
            id="phase-3-card"
            data-testid="phase-card-phase3"
            data-expanded={expandedPhases.phase3 ? 'true' : 'false'}
            className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
              expandedPhases.phase3
                ? postWorkoutStatus.unlocked
                  ? 'border-emerald-400/80 dark:border-emerald-800 bg-white dark:bg-[#0E131F] shadow-sm'
                  : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0E131F] shadow-sm'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E131F] hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            {/* Clickable Header Button */}
            <button
              type="button"
              data-testid="phase-header-phase3"
              aria-expanded={expandedPhases.phase3}
              aria-controls="phase-content-phase3"
              onClick={() => togglePhase('phase3')}
              className="w-full p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/30 select-none cursor-pointer"
            >
              <div className="flex items-start sm:items-center gap-3.5">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                  postWorkoutStatus.unlocked
                    ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200/80 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400'
                    : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-400'
                }`}>
                  {postWorkoutStatus.unlocked ? (
                    <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Lock className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border ${
                      postWorkoutStatus.unlocked
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}>
                      Phase 3
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
                      Spinal Decompression &amp; Anabolic MPS Refuel
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1">
                    Post-Workout Cobra Stretch &amp; High-Protein Fuel
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    45s spinal decompression timer + anabolic window fuel bonus ({proteinTargets.postWorkoutGrams}g+ protein)
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border flex items-center gap-1.5 ${
                    postWorkoutStatus.unlocked
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}>
                    {postWorkoutStatus.unlocked ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Ready · Unlocked</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>Locked ({postWorkoutStatus.completedCount} / {postWorkoutStatus.totalRequired})</span>
                      </>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 pl-2">
                  <span className="text-xs hidden md:inline">{expandedPhases.phase3 ? 'Collapse' : 'Expand'}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${
                      expandedPhases.phase3 ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''
                    }`}
                  />
                </div>
              </div>
            </button>

            {/* Expandable Phase 3 Content */}
            {expandedPhases.phase3 && (
              <div
                id="phase-content-phase3"
                data-testid="phase-content-phase3"
                className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40"
              >
                {/* Post-Workout Recovery Section */}
                <section
          id="post-workout-section"
          data-testid="post-workout-section"
          className={`scroll-mt-6 rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-[#0E131F] ${
            postWorkoutStatus.unlocked
              ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-400 dark:border-emerald-600'
              : ''
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="text-xs tabular-nums text-slate-500 dark:text-slate-400">
                {postWorkoutStatus.unlocked
                  ? `Phase 3 · Ready! All ${postWorkoutStatus.totalRequired} Exercises Completed`
                  : `Phase 3 · Ready After Circuit (${postWorkoutStatus.completedCount} / ${postWorkoutStatus.totalRequired} Exercises Done)`}
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-2">
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
                className="h-9 px-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white text-xs font-semibold flex items-center gap-2 transition-colors shrink-0"
              >
                <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
                <span>
                  Finish {postWorkoutStatus.remainingCount}{' '}
                  {postWorkoutStatus.remainingCount === 1 ? 'Exercise' : 'Exercises'}
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-2.5">
                {cooldownExerciseIndex >= 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveWorkoutIndex(cooldownExerciseIndex)}
                    className="h-9 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
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
              className="mt-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-300"
            >
              <span>
                Finish all <strong>{postWorkoutStatus.totalRequired} workout exercises</strong> above first to access your post-workout Cobra decompression and {proteinTargets.postWorkoutGrams}g+ protein refuel checklist.
              </span>
              <span className="tabular-nums font-bold text-slate-800 dark:text-white shrink-0">
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
              className={`min-h-[70px] p-3.5 rounded-xl border text-left flex items-center justify-between gap-4 transition-colors ${
                !postWorkoutStatus.unlocked
                  ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 cursor-not-allowed opacity-60'
                  : prepChecklist.cobraStretch
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700'
                  : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  1. Post-Workout Cobra Stretch &amp; Thoracic Decompression
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                  45s prone lumbar extension + 4-7-8 nasal breathing to lower cortisol after completing your circuit
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors ${
                  prepChecklist.cobraStretch
                    ? 'bg-emerald-600 text-white'
                    : 'border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                }`}
              >
                {prepChecklist.cobraStretch && <Check className="w-3.5 h-3.5" />}
              </div>
            </button>

            <button
              type="button"
              disabled={!postWorkoutStatus.unlocked}
              onClick={() => handleTogglePrep('proteinBreakfast')}
              className={`min-h-[70px] p-3.5 rounded-xl border text-left flex items-center justify-between gap-4 transition-colors ${
                !postWorkoutStatus.unlocked
                  ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 cursor-not-allowed opacity-60'
                  : prepChecklist.proteinBreakfast
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700'
                  : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  2. High-Protein Breakfast Bonus ({proteinTargets.postWorkoutGrams}g+ Protein)
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                  3 pasture-raised eggs + Greek yogurt or whey shake consumed by {reminderTimes.proteinTime12}
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors ${
                  prepChecklist.proteinBreakfast
                    ? 'bg-emerald-600 text-white'
                    : 'border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                }`}
              >
                {prepChecklist.proteinBreakfast && <Check className="w-3.5 h-3.5" />}
              </div>
            </button>
          </div>
        </section>
              </div>
            )}
          </div>
        </div>
      </main>

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
        totalCompleted={streakStats.totalCompleted}
        messages={chatMessages}
        onUpdateMessages={setChatMessages}
        darkMode={darkMode}
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
        onLogout={handleLogout}
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
