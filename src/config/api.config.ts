export const API_CONFIG = {
    OPENAI: {
      API_KEY: process.env.EXPO_PUBLIC_OPENAI_API,
      BASE_URL: 'https://api.openai.com/v1',
      MODEL: 'gpt-4o-mini',
    },
    ELEVENLABS: {
      API_KEY: process.env.EXPO_PUBLIC_ELEVENLABS_API,
      BASE_URL: 'https://api.elevenlabs.io/v1',
      VOICE_ID: '2EiwWnXFnvU5JabPnv8n',
      MODEL_ID: 'eleven_flash_v2_5'
    },
  };