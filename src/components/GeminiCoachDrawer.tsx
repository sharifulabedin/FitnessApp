import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Trash2 } from 'lucide-react';
import { UserProfile, generateCoachFallbackResponse } from '../utils/fitnessLogic';

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
  messages: ChatMessage[];
  onUpdateMessages: (msgs: ChatMessage[]) => void;
}

const QUICK_PROMPTS = [
  'I feel a bit sore today, should I modify my push-ups?',
  'Give me a high-protein breakfast idea.',
  'How do I set up the towel grip for ledge pull-ups?',
  'Why does the 3-1-1 tempo build muscle in 20 minutes?',
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
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gemini-coach-drawer-title"
    >
      <div className="w-full max-w-lg bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col justify-between">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h2 id="gemini-coach-drawer-title" className="text-lg font-bold text-slate-900">
                  Gemini AI Fitness Coach
                </h2>
                <p className="text-xs text-slate-500">
                  Tailored for {profile.name} · {profile.currentWeightKg}kg → {profile.targetWeightKg}kg · {activeStreak}d Streak
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleClearChat}
                aria-label="Reset conversation history"
                className="min-h-[44px] min-w-[44px] rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 flex items-center justify-center transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close Gemini Coach drawer"
                className="min-h-[44px] min-w-[44px] rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Model Tier Selector */}
          <div className="mt-3 flex items-center justify-between gap-2 bg-slate-200/70 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setSelectedModel('gemini-4-argon')}
              className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                selectedModel === 'gemini-4-argon'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Argon 4 (Deep)
            </button>
            <button
              type="button"
              onClick={() => setSelectedModel('gemini-3.8-flash')}
              className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                selectedModel === 'gemini-3.8-flash'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              3.8 Flash (Balanced)
            </button>
            <button
              type="button"
              onClick={() => setSelectedModel('gemini-3.1-flash-lite')}
              className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                selectedModel === 'gemini-3.1-flash-lite'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              3.1 Lite (Fast)
            </button>
          </div>
        </div>

        {/* Scrollable Message Thread */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {apiNotice && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
              {apiNotice}
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                  msg.role === 'user'
                    ? 'bg-rose-500 text-white rounded-br-xs'
                    : 'bg-slate-100 text-slate-800 border border-slate-200/80 rounded-bl-xs'
                }`}
              >
                {msg.text.split(/(\*\*.*?\*\*)/g).map((part, i) =>
                  part.startsWith('**') && part.endsWith('**') ? (
                    <strong key={i} className="font-bold text-slate-950">
                      {part.slice(2, -2)}
                    </strong>
                  ) : (
                    <React.Fragment key={i}>{part}</React.Fragment>
                  )
                )}
              </div>
              <div className="mt-1 text-[11px] text-slate-400 font-mono tabular-nums">
                {msg.role === 'user' ? profile.name : `Coach · ${msg.modelUsed || 'gemini-4-argon'}`} · {msg.timestamp}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start">
              <div className="bg-slate-100 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-600 font-medium">
                Analyzing {profile.name}&apos;s hypertrophy baselines with {selectedModel}...
              </div>
            </div>
          )}

          <div ref={threadEndRef} />
        </div>

        {/* Quick Prompts & Input Bar */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <div className="text-xs font-medium text-slate-500 mb-2">
            Quick Coaching Questions:
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {QUICK_PROMPTS.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => sendMessage(q)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 text-xs font-medium transition-colors whitespace-nowrap shrink-0"
              >
                {q}
              </button>
            ))}
          </div>

          <form onSubmit={handleFormSubmit} className="mt-2 flex items-center gap-2">
            <label htmlFor="coach-chat-input" className="sr-only">
              Ask Gemini Fitness Coach
            </label>
            <input
              id="coach-chat-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about sore muscles, push-up modifications, or protein meals..."
              className="flex-1 min-h-[46px] px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              aria-label="Send message to Gemini Coach"
              className="min-h-[46px] px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white font-semibold text-sm flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
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
