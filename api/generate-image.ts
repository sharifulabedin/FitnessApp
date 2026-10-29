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

export default async function imageHandler(req: any, res: any) {
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
      prompt,
      imageSize = '1K',
      aspectRatio = '16:9',
    } = body || {};

    if (!prompt || typeof prompt !== 'string') {
      if (typeof res.status === 'function') {
        res.status(400).json({ error: 'Please provide an image prompt.' });
      } else {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Please provide an image prompt.' }));
      }
      return;
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY') {
      const payload = {
        imageUrl: '',
        fallback: true,
        notice: 'Rendered high-resolution Studio Blueprint (paid API key not active).',
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
      const payload = {
        imageUrl: '',
        fallback: true,
        notice: 'Rendered high-resolution Studio Blueprint.',
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

    const payload = {
      imageUrl,
      text: accompanyingText,
      imageSize: selectedSize,
      aspectRatio: selectedRatio,
      model: 'gemini-3-pro-image-preview',
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
    const raw = err instanceof Error ? err.message : '';
    const conciseNotice =
      raw.includes('429') || raw.includes('RESOURCE_EXHAUSTED') || raw.includes('quota')
        ? 'Live image quota reached — rendered high-resolution Local Studio Blueprint.'
        : 'Rendered high-resolution Local Studio Blueprint.';

    const payload = {
      imageUrl: '',
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
