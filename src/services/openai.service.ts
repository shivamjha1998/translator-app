import { API_CONFIG } from '@/src/config/api.config';

const OPENAI_API_KEY = API_CONFIG.OPENAI.API_KEY;
const OPENAI_BASE_URL = API_CONFIG.OPENAI.BASE_URL;

if (!OPENAI_API_KEY) {
  console.warn('Missing OPENAI_API_KEY in environment variables');
}

export type TranslationDirection = 'auto' | 'en-ja' | 'ja-en';

export interface TranslationResult {
  inputLang: 'en' | 'ja';
  translated: string;
  romanized?: string | null;
}

class OpenAIService {
  async translateText(
    text: string,
    direction: TranslationDirection = 'auto',
  ): Promise<TranslationResult> {
    const systemInstruction = (() => {
      switch (direction) {
        case 'en-ja':
          return `
You are an English→Japanese translator.
- The user input is English.
- Output natural, conversational Japanese.
- Also output a romanized version if useful.
- Return ONLY JSON in this shape:
{"inputLang":"en","translated":"...","romanized":"... or null"}
`.trim();
        case 'ja-en':
          return `
You are a Japanese→English translator.
- The user input is Japanese.
- Output natural, conversational English.
- Romanized can be null.
- Return ONLY JSON in this shape:
{"inputLang":"ja","translated":"...","romanized":"... or null"}
`.trim();
        case 'auto':
        default:
          return `
You are an English–Japanese conversational translator.
Rules:
- Detect if the user's input is mainly English or Japanese.
- If English, translate into natural Japanese.
- If Japanese, translate into natural English.
- Include a romanized version if the output is Japanese, otherwise null.
- Return ONLY JSON, nothing else, in this exact shape:
{"inputLang":"en"|"ja","translated":"...","romanized":"... or null"}
`.trim();
      }
    })();

    const res = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: API_CONFIG.OPENAI.MODEL,
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: text },
        ],
        temperature: 0.3,
      }),
    });

    // Error handling logic
    if (!res.ok) {
      const textRes = await res.text();
      console.error('OpenAI translate error:', textRes);
      throw new Error('Failed to translate text with OpenAI');
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No translation returned from OpenAI');
    }

    try {
      const parsed = JSON.parse(content);
      const inputLang: 'en' | 'ja' = parsed.inputLang === 'ja' ? 'ja' : 'en';
      const translated: string = parsed.translated ?? parsed.translation ?? parsed.text ?? '';
      const romanized: string | null = parsed.romanized ?? null;

      if (!translated || typeof translated !== 'string') {
        return { inputLang, translated: content, romanized: null };
      }
      return { inputLang, translated, romanized };
    } catch (err) {
      console.error('Failed to parse translation JSON, using raw content:', content);
      return {
        inputLang: direction === 'ja-en' ? 'ja' : direction === 'en-ja' ? 'en' : 'en',
        translated: content,
        romanized: null,
      };
    }
  }
}

export const openAIService = new OpenAIService();
