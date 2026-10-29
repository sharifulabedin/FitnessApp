import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chatHandler from './api/chat';
import imageHandler from './api/generate-image';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // Multi-turn Gemini AI Fitness Coach endpoint
  app.post('/api/chat', (req, res) => {
    chatHandler(req, res);
  });

  // High-quality Image Generation endpoint
  app.post('/api/generate-image', (req, res) => {
    imageHandler(req, res);
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
