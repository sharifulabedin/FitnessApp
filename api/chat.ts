import { GoogleGenAI } from '@google/genai';

function getGenAIClient(): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || 'missing-api-key',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export default async function chatHandler(req: any, res: any) {
  if (req.method !== 'POST') {
    if (typeof res.status === 'function') {
      res.status(405).json({ error: 'Method Not Allowed' });
    } else {
      res.statusCode = 405;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    }
    return;
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }

    const {
      messages = [],
      model = 'gemini-4-argon',
      profile,
      activeStreak = 0,
    } = body || {};

    const allowedModels = ['gemini-4-argon', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'];
    const selectedModel = allowedModels.includes(model) ? model : 'gemini-4-argon';

    const systemInstruction = `You are the "Morning 20" AI Hypertrophy & Calisthenics Coach.
User Profile:
- Name: ${profile?.name || 'Sharif'}
- Height: ${profile?.heightCm || 175} cm
- Current Weight: ${profile?.currentWeightKg || 66} kg | Target Weight: ${profile?.targetWeightKg || 72} kg
- Max Push-Ups Baseline: ${profile?.maxPushUps || 5} reps
- Max Ledge Pull-Ups Baseline: ${profile?.maxPullUps || 3} reps
- Active Streak: ${activeStreak} days

Your coaching role:
1. Specialize in the 20-Minute Morning Full-Body Calisthenics Routine (Warm-up Lunge Twists & Scapular Push-ups, 3-1-1 Tempo Drop-Set Push-Ups, Bed-Edge Bulgarian Split Squats, Towel-Grip Ledge Pull-Ups with 4s negatives, Bed Pike Push-Ups, and Post-Workout Cobra Stretch).
2. Give concise, actionable, encouraging advice grounded in hypertrophy science (mechanical tension, 3-1-1 tempo: 3s eccentric, 1s isometric pause, 1s concentric drive) and practical high-protein morning nutrition (eggs, dates, Greek yogurt, oats, whey/paneer).
3. Keep responses structured with short bullet points and under 180 words.`;

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY') {
      const payload = {
        text: '',
        fallback: true,
        notice: 'Calibrated Profile Coaching Engine active (no live API key configured).',
      };
      if (typeof res.status === 'function') {
        res.status(200).json(payload);
      } else {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(payload));
      }
      return;
    }

    const ai = getGenAIClient();
    const contents = Array.isArray(messages) && messages.length > 0
      ? messages.map((m: { role: string; text: string }) => ({
          role: m.role === 'model' ? 'model' : 'user',
          parts: [{ text: String(m.text || '') }],
        }))
      : [{ role: 'user', parts: [{ text: 'Hello Coach!' }] }];

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const payload = {
      text: response.text || '',
      model: selectedModel,
      fallback: false,
    };

    if (typeof res.json === 'function') {
      res.json(payload);
    } else {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(payload));
    }
  } catch (err: unknown) {
    const raw = err instanceof Error ? err.message : 'Gemini API unavailable';
    const conciseNotice =
      raw.includes('429') || raw.includes('RESOURCE_EXHAUSTED') || raw.includes('quota')
        ? 'Live Gemini quota reached — answered via Calibrated Profile Engine.'
        : 'Answered via Calibrated Profile Engine.';

    const payload = {
      text: '',
      fallback: true,
      notice: conciseNotice,
    };

    if (typeof res.status === 'function') {
      res.status(200).json(payload);
    } else {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(payload));
    }
  }
}
