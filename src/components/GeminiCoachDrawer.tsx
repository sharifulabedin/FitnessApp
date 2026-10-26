import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Bot,
  Trash2,
} from 'lucide-react';
import {
  UserProfile,
  generateCoachFallbackResponse,
} from '../utils/fitnessLogic';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  modelUsed?: string;
  isLocalEngine?: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  activeStreak: number;
  totalCompleted?: number;
  messages: ChatMessage[];
  onUpdateMessages: (msgs: ChatMessage[]) => void;
  darkMode?: boolean;
}

const QUICK_PROMPTS = [
  'How do I progress to Archer Push-Ups?',
  'My wrists feel sore during push-ups, what can I do?',
  'What should I eat within 45 mins after workout?',
  'Explain 3-1-1 hypertrophy tempo in simple terms.',
  'How should I position my hands on Bulgarian Split Squats?',
];

export const GeminiCoachDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  profile,
  activeStreak,
  messages,
  onUpdateMessages,
}) => {
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState<'gemini-4-argon' | 'gemini-3.8-flash' | 'gemini-3.1-flash-lite'>('gemini-4-argon');
  const [isLoading, setIsLoading] = useState(false);
  const [apiNotice, setApiNotice] = useState<string | null>(null);
  const threadEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages.length]);

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

  const sendMessage = async (promptText: string) => {
    const trimmed = promptText.trim();
    if (!trimmed || isLoading) return;

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: nowTime,
    };

    const nextHistory = [...messages, userMsg];
    onUpdateMessages(nextHistory);
    setInput('');
    setIsLoading(true);
    setApiNotice(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextHistory.map((m) => ({ role: m.role, text: m.text })),
          model: selectedModel,
          profile,
          activeStreak,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.fallback || !data.text) {
        const cleanNotice =
          data?.notice || 'Answered via Calibrated Profile Coaching Engine.';
        setApiNotice(cleanNotice);
        const fallbackReply = generateCoachFallbackResponse(trimmed, profile, activeStreak);
        const coachMsg: ChatMessage = {
          id: `model-${Date.now()}`,
          role: 'model',
          text: fallbackReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: `${selectedModel} (Profile Engine)`,
          isLocalEngine: true,
        };
        onUpdateMessages([...nextHistory, coachMsg]);
      } else {
        const coachMsg: ChatMessage = {
          id: `model-${Date.now()}`,
          role: 'model',
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: data.model || selectedModel,
          isLocalEngine: false,
        };
        onUpdateMessages([...nextHistory, coachMsg]);
      }
    } catch {
      setApiNotice('Using offline profile-tailored coaching engine.');
      const fallbackReply = generateCoachFallbackResponse(trimmed, profile, activeStreak);
      const coachMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: fallbackReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: `${selectedModel} (Profile Engine)`,
        isLocalEngine: true,
      };
      onUpdateMessages([...nextHistory, coachMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleClearChat = () => {
    const initialGreeting: ChatMessage = {
      id: 'welcome-msg',
      role: 'model',
      text: `Morning ${profile.name}! I'm calibrated to your baseline (${profile.maxPushUps} Push-ups · ${profile.maxPullUps} Ledge Pull-ups) and your ${profile.currentWeightKg}kg → ${profile.targetWeightKg}kg hypertrophy goal. Ask me about form adjustments, sore muscle modifications, or post-workout protein meals.`,
      timestamp: '7:00 AM',
      modelUsed: selectedModel,
    };
    onUpdateMessages([initialGreeting]);
    setApiNotice(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/75 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gemini-coach-drawer-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 h-full border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-rose-500 text-white flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h2 id="gemini-coach-drawer-title" className="text-base font-bold text-slate-900 dark:text-white">
                  Gemini AI Fitness Coach
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tailored for {profile.name} · {profile.currentWeightKg}kg → {profile.targetWeightKg}kg · {activeStreak}d Streak
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleClearChat}
                aria-label="Reset conversation history"
                className="w-8 h-8 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close Gemini Coach drawer"
                className="w-8 h-8 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Model Tier Selector */}
          <div className="mt-3.5 flex items-center justify-between gap-1.5 bg-slate-200/80 dark:bg-slate-800 p-1 rounded-lg border border-slate-300/40 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setSelectedModel('gemini-4-argon')}
              className={`flex-1 h-8 px-2 rounded-md text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                selectedModel === 'gemini-4-argon'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Argon 4
            </button>
            <button
              type="button"
              onClick={() => setSelectedModel('gemini-3.8-flash')}
              className={`flex-1 h-8 px-2 rounded-md text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                selectedModel === 'gemini-3.8-flash'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              3.8 Flash
            </button>
            <button
              type="button"
              onClick={() => setSelectedModel('gemini-3.1-flash-lite')}
              className={`flex-1 h-8 px-2 rounded-md text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                selectedModel === 'gemini-3.1-flash-lite'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              3.1 Lite
            </button>
          </div>
        </div>

        {/* Scrollable Message Thread */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {apiNotice && (
            <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200">
              {apiNotice}
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                  msg.role === 'user'
                    ? 'bg-rose-500 text-white rounded-br-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded-bl-xs'
                }`}
              >
                {msg.text.split(/(\*\*.*?\*\*)/g).map((part: string, i: number) =>
                  part.startsWith('**') && part.endsWith('**') ? (
                    <strong key={i} className="font-bold text-slate-950 dark:text-white">
                      {part.slice(2, -2)}
                    </strong>
                  ) : (
                    <React.Fragment key={i}>{part}</React.Fragment>
                  )
                )}
              </div>
              <div className="mt-1 text-xs text-slate-400 dark:text-slate-500 tabular-nums">
                {msg.role === 'user' ? profile.name : `Coach · ${msg.modelUsed || 'gemini-4-argon'}`} · {msg.timestamp}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start">
              <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-600 dark:text-slate-300 font-medium">
                Analyzing {profile.name}&apos;s hypertrophy baselines with {selectedModel}...
              </div>
            </div>
          )}

          <div ref={threadEndRef} />
        </div>

        {/* Quick Prompts & Input Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
            Quick Coaching Questions:
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {QUICK_PROMPTS.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => sendMessage(q)}
                className="h-8 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-slate-700 hover:text-rose-700 dark:hover:text-rose-300 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors whitespace-nowrap shrink-0 border border-slate-200/60 dark:border-slate-700"
              >
                {q}
              </button>
            ))}
          </div>

          <form onSubmit={handleFormSubmit} className="mt-2.5 flex items-center gap-2">
            <label htmlFor="coach-chat-input" className="sr-only">
              Ask Gemini Fitness Coach
            </label>
            <input
              id="coach-chat-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about sore muscles, push-up modifications, or protein meals..."
              className="flex-1 h-10 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500 focus:bg-white dark:focus:bg-slate-900"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              aria-label="Send message to Gemini Coach"
              className="h-10 px-4 rounded-lg bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white font-semibold text-sm flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
            >
              <Send className="w-4 h-4" />
              <span>Ask</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
