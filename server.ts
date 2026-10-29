import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // Multi-turn Gemini AI Fitness Coach endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      const {
        messages = [],
        model = 'gemini-4-argon',
        profile,
        activeStreak = 0,
      } = req.body || {};

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
        res.status(200).json({
          text: '',
          fallback: true,
          notice: 'Calibrated Profile Coaching Engine active (no live API key configured).',
        });
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

      res.json({
        text: response.text || '',
        model: selectedModel,
        fallback: false,
      });
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : 'Gemini API unavailable';
      const conciseNotice =
        raw.includes('429') || raw.includes('RESOURCE_EXHAUSTED') || raw.includes('quota')
          ? 'Live Gemini quota reached — answered via Calibrated Profile Engine.'
          : 'Answered via Calibrated Profile Engine.';
      res.status(200).json({
        text: '',
        fallback: true,
        notice: conciseNotice,
      });
    }
  });

  // High-quality Image Generation endpoint using gemini-3-pro-image-preview (supports 1K, 2K, 4K)
  app.post('/api/generate-image', async (req, res) => {
    try {
      const {
        prompt,
        imageSize = '1K',
        aspectRatio = '16:9',
      } = req.body || {};

      if (!prompt || typeof prompt !== 'string') {
        res.status(400).json({ error: 'Please provide an image prompt.' });
        return;
      }

      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY') {
        res.status(200).json({
          imageUrl: '',
          fallback: true,
          notice: 'Rendered high-resolution Studio Blueprint (paid API key not active).',
        });
        return;
      }

      const validSizes = ['1K', '2K', '4K'];
      const selectedSize = validSizes.includes(imageSize) ? imageSize : '1K';
      const validRatios = ['1:1', '3:4', '4:3', '9:16', '16:9'];
      const selectedRatio = validRatios.includes(aspectRatio) ? aspectRatio : '16:9';

      const ai = getGenAIClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [
            {
              text: prompt,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: selectedRatio,
            imageSize: selectedSize,
          },
        },
      });

      let imageUrl = '';
      let accompanyingText = '';
      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          imageUrl = `data:${mime};base64,${part.inlineData.data}`;
        } else if (part.text) {
          accompanyingText += part.text;
        }
      }

      if (!imageUrl) {
        res.status(200).json({
          imageUrl: '',
          fallback: true,
          notice: 'Rendered high-resolution Studio Blueprint.',
        });
        return;
      }

      res.json({
        imageUrl,
        text: accompanyingText,
        imageSize: selectedSize,
        aspectRatio: selectedRatio,
        model: 'gemini-3-pro-image-preview',
        fallback: false,
      });
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : '';
      const conciseNotice =
        raw.includes('429') || raw.includes('RESOURCE_EXHAUSTED') || raw.includes('quota')
          ? 'Live image quota reached — rendered high-resolution Local Studio Blueprint.'
          : 'Rendered high-resolution Local Studio Blueprint.';
      res.status(200).json({
        imageUrl: '',
        fallback: true,
        notice: conciseNotice,
      });
    }
  });

  const distPath = path.join(__dirname, 'dist');
  const hasBuiltDist = fs.existsSync(path.join(distPath, 'index.html'));
  const isDevCommand =
    process.argv.some((arg) => arg.includes('tsx')) ||
    process.env.NODE_ENV === 'development';
  const isProduction = hasBuiltDist && !isDevCommand;

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Graceful error handler to prevent crashing from file or request errors
  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled server error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Morning 20 server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
